import { Expose, Type } from 'class-transformer';
import { TaskStatus, TaskPriority } from '@prisma/client';

export class CurrentFocusTaskDto {
    @Expose()
    id!: number;

    @Expose()
    title!: string;

    @Expose()
    priority!: TaskPriority;

    @Expose()
    estimatedTime!: number;

    @Expose()
    storyPoints!: number;
}

export class TaskSummaryMetricsDto {
    @Expose()
    assigned!: number;

    @Expose()
    completed!: number;

    @Expose()
    pending!: number;

    @Expose()
    workloadPercentage!: number;
}

export class UpcomingQueueItemDto {
    @Expose()
    id!: number;

    @Expose()
    title!: string;

    @Expose()
    priority!: TaskPriority;

    @Expose()
    estimatedTime!: number;

    @Expose()
    storyPoints!: number;
}

export class SprintStatusWidgetDto {
    @Expose()
    tasksCompleted!: number;

    @Expose()
    tasksTotal!: number;

    @Expose()
    daysRemaining!: number;

    @Expose()
    myStoryPoints!: number;
}

export class RecentActivityDto {
    @Expose()
    id!: number;

    @Expose()
    user!: string;

    @Expose()
    action!: string;

    @Expose()
    target!: string;

    @Expose()
    timeAgo!: string;
}

export class DeveloperMainDashboardDto {
    @Expose()
    @Type(() => CurrentFocusTaskDto)
    currentFocus!: CurrentFocusTaskDto | null;

    @Expose()
    @Type(() => TaskSummaryMetricsDto)
    metrics!: TaskSummaryMetricsDto;

    @Expose()
    @Type(() => UpcomingQueueItemDto)
    upcomingQueue!: UpcomingQueueItemDto[];

    @Expose()
    @Type(() => SprintStatusWidgetDto)
    sprintStatus!: SprintStatusWidgetDto;

    @Expose()
    @Type(() => RecentActivityDto)
    recentActivity!: RecentActivityDto[];

    constructor(partial: Partial<DeveloperMainDashboardDto>) {
        Object.assign(this, partial);
    }
}
