import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaService } from '../../database/prisma.service';
import { DashboardStatsResponseDto, AnalyticsResponseDto, DashboardAnalyticsResponseDto, TopCountryResponseDto, DashboardOverviewResponseDto, DeviceTypeResponseDto, VisitorInsightDto, TrafficSourceDto } from './dto/response';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { ConfigService } from '@nestjs/config';
import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { google } from '@google-analytics/data/build/protos/protos';

@Injectable()
export class DashboardService implements OnModuleInit {
    private readonly logger = new Logger(DashboardService.name);
    private analyticsDataClient: BetaAnalyticsDataClient | null = null;

    constructor(
        private readonly prisma: PrismaService,
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
        private readonly configService: ConfigService,
    ) { }

    /**
     * Initializes the Google Analytics Data API client once at application startup.
     * Validates configuration, resolves the key file path, and logs the service account email.
     */
    async onModuleInit(): Promise<void> {
        const propertyId = this.configService.get<string>('app.googleAnalytics.propertyId');
        const rawKeyFilename = this.configService.get<string>('app.googleAnalytics.keyFilename');

        if (!propertyId || !rawKeyFilename) {
            this.logger.warn('Google Analytics configuration missing (GOOGLE_ANALYTICS_PROPERTY_ID or GOOGLE_APPLICATION_CREDENTIALS). Top countries feature disabled.');
            return;
        }

        if (propertyId.startsWith('G-')) {
            this.logger.error(
                `Property ID '${propertyId}' appears to be a Measurement ID. ` +
                `The Google Analytics Data API requires the numeric Property ID (e.g., 123456789). ` +
                `Find it at: Admin > Property > Property Details.`,
            );
            return;
        }

        // Resolve relative paths against the project root
        const resolvedKeyFilename = path.isAbsolute(rawKeyFilename)
            ? rawKeyFilename
            : path.resolve(process.cwd(), rawKeyFilename);

        if (!fs.existsSync(resolvedKeyFilename)) {
            this.logger.error(`Google Analytics key file not found at: ${resolvedKeyFilename}`);
            return;
        }

        try {
            this.analyticsDataClient = new BetaAnalyticsDataClient({
                keyFilename: resolvedKeyFilename,
            });

            // Read service account email from key file for permission debugging
            const keyFileContent = JSON.parse(fs.readFileSync(resolvedKeyFilename, 'utf-8')) as { client_email?: string };

            this.logger.log(
                `GA client initialized | Service Account: ${keyFileContent.client_email ?? 'unknown'} | Property: ${propertyId}`,
            );
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            this.logger.error(`Failed to initialize Google Analytics client: ${message}`);
            this.analyticsDataClient = null;
        }
    }

    async getAnalytics(): Promise<DashboardAnalyticsResponseDto> {
        const weeklyBookings: AnalyticsResponseDto[] = [];
        const today = new Date();

        // Loop for the last 7 days (including today)
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);

            const startOfDay = new Date(date.setHours(0, 0, 0, 0));
            const endOfDay = new Date(date.setHours(23, 59, 59, 999));

            const count = 0;

            const dayName = startOfDay.toLocaleDateString('en-US', { weekday: 'short' });

            weeklyBookings.push(new AnalyticsResponseDto({
                day: dayName,
                count: count,
            }));
        }

        return new DashboardAnalyticsResponseDto({
            weeklyBookings,
        });
    }

    async getDashboardStats(): Promise<DashboardStatsResponseDto> {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const [
            totalBookingsCurrentMonth,
            confirmedBookingsCurrentMonth,
            unreadMessages
        ] = await Promise.all([
            Promise.resolve(0),
            Promise.resolve(0),
            Promise.resolve(0)
        ]);

        const conversionRate = totalBookingsCurrentMonth > 0
            ? (confirmedBookingsCurrentMonth / totalBookingsCurrentMonth) * 100
            : 0;

        return new DashboardStatsResponseDto({
            totalBookingsCurrentMonth,
            confirmedBookingsCurrentMonth,
            conversionRateCurrentMonth: Number(conversionRate.toFixed(2)),
            unreadMessages
        });
    }

    /**
     * Fetches dashboard overview including top countries and device usage.
     * Executes parallel GA4 reports for optimal performance.
     */
    /**
     * Fetches dashboard overview including top countries, device usage, and visitor insights (last 30 days).
     * Executes parallel GA4 reports for optimal performance.
     */
    async getDashboardOverview(limit = 5): Promise<DashboardOverviewResponseDto> {
        const cacheKey = `dashboard:overview:${limit}`;
        const cached = await this.cacheManager.get<DashboardOverviewResponseDto>(cacheKey);

        if (cached) {
            this.logger.debug(`Cache hit for ${cacheKey}`);
            return cached;
        }

        const emptyOverview = new DashboardOverviewResponseDto({
            countries: [],
            deviceTypes: new DeviceTypeResponseDto({ desktop: 0, mobile: 0, tablet: 0 }),
            visitorInsights: [],
            trafficSources: [],
        });

        if (!this.analyticsDataClient) {
            this.logger.warn('Google Analytics client not initialized. Returning empty overview.');
            return emptyOverview;
        }

        try {
            const propertyId = this.configService.get<string>('app.googleAnalytics.propertyId');

            // Define parallel reports - All set to last 30 days (29daysAgo + today)
            const countryReportPromise = this.analyticsDataClient.runReport({
                property: `properties/${propertyId}`,
                dateRanges: [{ startDate: '29daysAgo', endDate: 'today' }],
                dimensions: [{ name: 'country' }],
                metrics: [{ name: 'activeUsers' }],
                orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
                limit: limit + 5,
                returnPropertyQuota: true, // Monitor quota here
            });

            const deviceReportPromise = this.analyticsDataClient.runReport({
                property: `properties/${propertyId}`,
                dateRanges: [{ startDate: '29daysAgo', endDate: 'today' }],
                dimensions: [{ name: 'deviceCategory' }],
                metrics: [{ name: 'activeUsers' }],
            });

            const visitorsReportPromise = this.analyticsDataClient.runReport({
                property: `properties/${propertyId}`,
                dateRanges: [{ startDate: '29daysAgo', endDate: 'today' }], // Last 30 days including today
                dimensions: [{ name: 'date' }], // Format: YYYYMMDD
                metrics: [{ name: 'activeUsers' }],
                orderBys: [{ dimension: { dimensionName: 'date' }, desc: false }], // Ascending order
            });

            const trafficSourceReportPromise = this.analyticsDataClient.runReport({
                property: `properties/${propertyId}`,
                dateRanges: [{ startDate: '29daysAgo', endDate: 'today' }],
                dimensions: [{ name: 'sessionDefaultChannelGroup' }],
                metrics: [{ name: 'activeUsers' }],
                orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
                limit: 10,
            });

            const [[countryResponse], [deviceResponse], [visitorsResponse], [trafficResponse]] = await Promise.all([
                countryReportPromise,
                deviceReportPromise,
                visitorsReportPromise,
                trafficSourceReportPromise
            ]);

            // Process Country Data
            const countries = (countryResponse.rows || [])
                .map((row: google.analytics.data.v1beta.IRow) => new TopCountryResponseDto({
                    country: row.dimensionValues?.[0]?.value || 'Unknown',
                    activeUsers: Number(row.metricValues?.[0]?.value || 0),
                }))
                .filter(item => item.country !== '(not set)')
                .slice(0, limit);

            // Process Device Data
            const deviceMap: Record<string, number> = { desktop: 0, mobile: 0, tablet: 0 };
            (deviceResponse.rows || []).forEach((row) => {
                const category = row.dimensionValues?.[0]?.value?.toLowerCase() || '';
                const users = Number(row.metricValues?.[0]?.value || 0);
                if (deviceMap.hasOwnProperty(category)) {
                    deviceMap[category] += users;
                } else if (category === 'mobile') {
                    deviceMap.mobile += users;
                }
            });

            // Process Visitor Insights Data - Ensure full 30 days
            const visitorMap = new Map<string, number>();
            (visitorsResponse.rows || []).forEach((row) => {
                const dateStr = row.dimensionValues?.[0]?.value || '';
                const users = Number(row.metricValues?.[0]?.value || 0);
                visitorMap.set(dateStr, users);
            });

            const visitorInsights: VisitorInsightDto[] = [];
            const today = new Date();

            // Loop 30 days back from today (0 to 29 days ago)
            for (let i = 29; i >= 0; i--) {
                const date = new Date(today);
                date.setDate(today.getDate() - i);

                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                const key = `${year}${month}${day}`; // YYYYMMDD format to match GA

                const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });

                visitorInsights.push(new VisitorInsightDto({
                    date: formattedDate,
                    activeUsers: visitorMap.get(key) || 0, // Default to 0 if no data from GA
                }));
            }

            // Process Traffic Source Data
            const trafficSources = (trafficResponse.rows || [])
                .map((row) => new TrafficSourceDto({
                    source: row.dimensionValues?.[0]?.value || 'Unknown',
                    activeUsers: Number(row.metricValues?.[0]?.value || 0),
                }))
                .filter(item => item.source !== '(not set)');

            const overview = new DashboardOverviewResponseDto({
                countries,
                deviceTypes: new DeviceTypeResponseDto({
                    desktop: deviceMap.desktop,
                    mobile: deviceMap.mobile,
                    tablet: deviceMap.tablet,
                }),
                visitorInsights,
                trafficSources,
            });

            // Log Quota
            if (countryResponse.propertyQuota) {
                const day = countryResponse.propertyQuota.tokensPerDay;
                const hour = countryResponse.propertyQuota.tokensPerHour;
                this.logger.log(`GA Quota | Day: ${day?.consumed}/${day?.remaining} | Hour: ${hour?.consumed}/${hour?.remaining}`);
            }

            await this.cacheManager.set(cacheKey, overview, 86400000); // 24 hours
            return overview;

        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            this.logger.error(`Failed to fetch GA overview: ${message}`);
            return emptyOverview;
        }
    }
}
