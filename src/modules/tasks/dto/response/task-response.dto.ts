import { Expose } from 'class-transformer';
import { Task, TaskPriority, TaskStatus, TaskType } from '@prisma/client';

export class TaskResponseDto {
    @Expose()
    id!: number;

    @Expose()
    title!: string;

    @Expose()
    description!: string | null;

    @Expose()
    type!: TaskType;

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
    assignee?: { id: string; name: string } | null;

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
