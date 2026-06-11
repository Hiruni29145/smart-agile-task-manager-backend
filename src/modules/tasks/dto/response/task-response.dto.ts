import { Expose } from 'class-transformer';
import { TaskPriority, TaskStatus } from '@prisma/client';

export class TaskResponseDto {
    @Expose()
    id!: number;

    @Expose()
    title!: string;

    @Expose()
    description!: string | null;

    @Expose()
    priority!: TaskPriority;

    @Expose()
    status!: TaskStatus;

    @Expose()
    storyPoints!: number | null;

    @Expose()
    estimatedTime!: number | null;

    @Expose()
    realTime!: number | null;

    @Expose()
    complexity!: number | null;

    @Expose()
    confidence!: number | null;

    @Expose()
    deadline!: Date | null;

    @Expose()
    projectId!: number;

    @Expose()
    sprintId!: number | null;

    @Expose()
    assigneeId!: string | null;

    @Expose()
    createdById!: string;

    @Expose()
    createdAt!: Date;

    @Expose()
    updatedAt!: Date;

    constructor(partial: Partial<TaskResponseDto>) {
        Object.assign(this, partial);
    }
}
