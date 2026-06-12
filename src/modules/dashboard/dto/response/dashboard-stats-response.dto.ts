import { Expose } from 'class-transformer';

export class DashboardStatsResponseDto {
    @Expose()
    activeProjects!: number;

    @Expose()
    activeSprints!: number;

    @Expose()
    openTasks!: number;

    @Expose()
    totalMembers!: number;

    constructor(partial: Partial<DashboardStatsResponseDto>) {
        Object.assign(this, partial);
    }
}
