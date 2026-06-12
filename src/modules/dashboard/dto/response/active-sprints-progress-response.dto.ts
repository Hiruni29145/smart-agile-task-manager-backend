import { Expose } from 'class-transformer';

export class ActiveSprintsProgressResponseDto {
    @Expose()
    projectId!: number;

    @Expose()
    projectName!: string;

    @Expose()
    sprintId!: number;

    @Expose()
    sprintName!: string;

    @Expose()
    completedTasks!: number;

    @Expose()
    totalTasks!: number;

    @Expose()
    progressPercentage!: number;

    @Expose()
    daysLeft!: number | null;

    constructor(partial: Partial<ActiveSprintsProgressResponseDto>) {
        Object.assign(this, partial);
    }
}
