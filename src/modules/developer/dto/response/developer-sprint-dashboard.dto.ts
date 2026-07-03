import { Expose, Type } from 'class-transformer';

export class SprintMetricsDto {
    @Expose()
    myStoryPoints!: number;

    @Expose()
    completedSp!: number;

    @Expose()
    remainingSp!: number;
}

export class BurndownDataPointDto {
    @Expose()
    day!: string;

    @Expose()
    ideal!: number;

    @Expose()
    actual!: number;
}

export class SprintTimelineEventDto {
    @Expose()
    date!: Date;

    @Expose()
    title!: string;

    @Expose()
    description?: string;
}

export class DeveloperSprintDashboardDto {
    @Expose()
    sprintId!: number;

    @Expose()
    sprintNo!: number;

    @Expose()
    startDate!: Date;

    @Expose()
    endDate!: Date;

    @Expose()
    daysRemaining!: number;

    @Expose()
    @Type(() => SprintMetricsDto)
    metrics!: SprintMetricsDto;

    @Expose()
    @Type(() => BurndownDataPointDto)
    burndownData!: BurndownDataPointDto[];

    @Expose()
    @Type(() => SprintTimelineEventDto)
    timeline!: SprintTimelineEventDto[];

    constructor(partial: Partial<DeveloperSprintDashboardDto>) {
        Object.assign(this, partial);
    }
}
