import { Expose, Type } from 'class-transformer';
import { AnalyticsResponseDto } from './analytics-response.dto';

export class DashboardAnalyticsResponseDto {
    @Expose()
    @Type(() => AnalyticsResponseDto)
    weeklyBookings!: AnalyticsResponseDto[] | null;

    constructor(partial: Partial<DashboardAnalyticsResponseDto>) {
        Object.assign(this, partial);
    }
}
