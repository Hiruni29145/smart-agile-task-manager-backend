import { IsInt, IsOptional, IsString, IsNumber, IsDateString, IsEnum } from 'class-validator';
import { TaskPriority, TaskStatus, TaskType } from '@prisma/client';

export class UpdateTaskRequestDto {
    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsInt()
    projectId?: number;

    @IsOptional()
    @IsInt()
    sprintId?: number;

    @IsOptional()
    @IsString()
    assigneeId?: string;

    @IsOptional()
    @IsEnum(TaskType)
    type?: TaskType;

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
