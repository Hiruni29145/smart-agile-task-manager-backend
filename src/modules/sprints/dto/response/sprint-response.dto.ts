import { Expose } from 'class-transformer';
import { SprintStatus } from '@prisma/client';

export class SprintResponseDto {
    @Expose()
    id!: number;

    @Expose()
    name!: string;

    @Expose()
    sprintNo!: number;

    @Expose()
    status!: SprintStatus;

    @Expose()
    startDate!: Date | null;

    @Expose()
    endDate!: Date | null;

    @Expose()
    projectId!: number;

    @Expose()
    createdAt!: Date;

    @Expose()
    updatedAt!: Date;

    @Expose()
    estimatedWorkload?: number;

    @Expose()
    storyPoints?: number;

    constructor(partial: Partial<SprintResponseDto>) {
        Object.assign(this, partial);
    }
}
