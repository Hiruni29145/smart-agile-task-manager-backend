import { Expose } from 'class-transformer';

export class TeamStatsResponseDto {
    @Expose()
    totalDeveloper!: number;

    @Expose()
    activeNow!: number;

    @Expose()
    overloaded!: number;

    @Expose()
    avgWorkload!: number;

    constructor(partial: Partial<TeamStatsResponseDto>) {
        Object.assign(this, partial);
    }
}
