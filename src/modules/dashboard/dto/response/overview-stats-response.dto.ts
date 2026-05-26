import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class OverviewStatsResponseDto {
    @Expose()
    totalUsers!: number;

    @Expose()
    activeUsers!: number;

    @Expose()
    inactiveUsers!: number;

    @Expose()
    suspendedUsers!: number;

    @Expose()
    totalNotifications!: number;

    @Expose()
    unreadNotifications!: number;

    @Expose()
    message!: string;

    constructor(partial: Partial<OverviewStatsResponseDto>) {
        Object.assign(this, partial);
    }
}
