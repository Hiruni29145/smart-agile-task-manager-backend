import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PrismaService } from '../../database/prisma.service';

export interface HealthStatus {
    status: 'ok' | 'error';
    timestamp: string;
    uptime: number;
    environment: string;
    version: string;
    checks: {
        database: {
            status: 'ok' | 'error';
            responseTime?: number;
            error?: string;
        };
        cache: {
            status: 'ok' | 'error' | 'disabled';
            type: 'redis' | 'memory';
            responseTime?: number;
            error?: string;
        };
        memory: {
            status: 'ok' | 'warning' | 'error';
            used: number;
            total: number;
            percentage: number;
        };
    };
}

@Injectable()
export class HealthService {
    private readonly startTime = Date.now();

    constructor(
        private readonly prisma: PrismaService,
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    ) { }

    async getHealth(): Promise<HealthStatus> {
        const dbCheck = await this.checkDatabase();
        const cacheCheck = await this.checkCache();
        const memoryCheck = this.checkMemory();

        const allHealthy =
            dbCheck.status === 'ok' &&
            (cacheCheck.status === 'ok' || cacheCheck.status === 'disabled') &&
            memoryCheck.status !== 'error';

        return {
            status: allHealthy ? 'ok' : 'error',
            timestamp: new Date().toISOString(),
            uptime: Math.floor((Date.now() - this.startTime) / 1000),
            environment: process.env.NODE_ENV || 'development',
            version: process.env.npm_package_version || '1.0.0',
            checks: {
                database: dbCheck,
                cache: cacheCheck,
                memory: memoryCheck,
            },
        };
    }

    private async checkDatabase(): Promise<HealthStatus['checks']['database']> {
        const startTime = Date.now();

        try {
            await this.prisma.$queryRaw`SELECT 1`;
            return {
                status: 'ok',
                responseTime: Date.now() - startTime,
            };
        } catch (error) {
            return {
                status: 'error',
                error: error instanceof Error ? error.message : 'Database connection failed',
            };
        }
    }

    private async checkCache(): Promise<HealthStatus['checks']['cache']> {
        const startTime = Date.now();
        const testKey = '__health_check__';

        // Check if it's a Redis store or in-memory
        const store = (this.cacheManager as { store?: { name?: string } }).store;
        const isRedis = store?.name === 'redis' || String(store).includes('redis');

        try {
            // Try to set and get a test value
            await this.cacheManager.set(testKey, 'ok', 1000);
            const value = await this.cacheManager.get(testKey);
            await this.cacheManager.del(testKey);

            if (value === 'ok') {
                return {
                    status: 'ok',
                    type: isRedis ? 'redis' : 'memory',
                    responseTime: Date.now() - startTime,
                };
            }

            return {
                status: 'error',
                type: isRedis ? 'redis' : 'memory',
                error: 'Cache read/write test failed',
            };
        } catch (error) {
            // If Redis is disabled, return disabled status
            if (process.env.REDIS_ENABLED === 'false') {
                return {
                    status: 'disabled',
                    type: 'memory',
                };
            }

            return {
                status: 'error',
                type: isRedis ? 'redis' : 'memory',
                error: error instanceof Error ? error.message : 'Cache check failed',
            };
        }
    }

    private checkMemory(): HealthStatus['checks']['memory'] {
        const memoryUsage = process.memoryUsage();
        const used = Math.round(memoryUsage.heapUsed / 1024 / 1024);
        const total = Math.round(memoryUsage.heapTotal / 1024 / 1024);
        const percentage = Math.round((used / total) * 100);

        let status: 'ok' | 'warning' | 'error' = 'ok';
        if (percentage > 90) {
            status = 'error';
        } else if (percentage > 75) {
            status = 'warning';
        }

        return {
            status,
            used,
            total,
            percentage,
        };
    }
}

