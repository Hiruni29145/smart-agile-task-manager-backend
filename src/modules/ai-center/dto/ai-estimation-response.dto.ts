import { Expose } from 'class-transformer';

export class AiEstimationResponseDto {
    @Expose()
    id!: number;

    @Expose()
    taskTitle!: string;

    @Expose()
    description?: string | null;

    @Expose()
    priority!: string;

    @Expose()
    taskType!: string;

    @Expose()
    estimatedHours!: number;

    @Expose()
    storyPoints!: number;

    @Expose()
    complexity!: string;

    @Expose()
    confidenceScore!: number;

    @Expose()
    createdById!: string;

    @Expose()
    createdAt!: Date;

    @Expose()
    updatedAt!: Date;

    constructor(partial: Partial<AiEstimationResponseDto>) {
        Object.assign(this, partial);
    }
}
