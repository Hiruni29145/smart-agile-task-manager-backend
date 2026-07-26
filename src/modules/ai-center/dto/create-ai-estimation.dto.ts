import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class CreateAiEstimationDto {
    @IsString()
    @IsNotEmpty()
    taskTitle!: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    priority?: string;

    @IsString()
    @IsOptional()
    taskType?: string;

    @IsNumber()
    @Min(0)
    estimatedHours!: number;

    @IsNumber()
    @Min(0)
    storyPoints!: number;

    @IsString()
    @IsNotEmpty()
    complexity!: string;

    @IsNumber()
    @Min(0)
    @Max(100)
    confidenceScore!: number;
}
