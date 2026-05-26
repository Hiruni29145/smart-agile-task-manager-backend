import { Expose } from 'class-transformer';

export class DashboardStatsResponseDto {
    @Expose()
    totalBookingsCurrentMonth!: number | null;

    @Expose()
    confirmedBookingsCurrentMonth!: number | null;

    @Expose()
    conversionRateCurrentMonth!: number | null;

    @Expose()
    unreadMessages!: number | null;

    constructor(partial: Partial<DashboardStatsResponseDto>) {
        Object.assign(this, partial);
    }
}
