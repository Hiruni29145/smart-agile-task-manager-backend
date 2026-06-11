import { IsInt, IsNotEmpty, IsOptional, IsString, IsNumber, IsDateString, IsEnum } from 'class-validator';
import { TaskPriority, TaskStatus } from '@prisma/client';

export class CreateTaskRequestDto {
    @IsString()
    @IsNotEmpty()
    title!: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsInt()
    @IsNotEmpty()
    projectId!: number;

    @IsOptional()
    @IsInt()
    sprintId?: number;

    @IsOptional()
    @IsString()
    assigneeId?: string;

    @IsOptional()
    @IsEnum(TaskPriority)
    priority?: TaskPriority;

    @IsOptional()
    @IsEnum(TaskStatus)
    status?: TaskStatus;

    @IsOptional()
    @IsNumber()
    storyPoints?: number;

    @IsOptional()
    @IsNumber()
    estimatedTime?: number;

    @IsOptional()
    @IsNumber()
    realTime?: number;

    @IsOptional()
    @IsInt()
    complexity?: number;

    @IsOptional()
    @IsInt()
    confidence?: number;

    @IsOptional()
    @IsDateString()
    deadline?: string;
}
