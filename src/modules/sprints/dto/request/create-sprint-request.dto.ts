import { IsInt, IsNotEmpty, IsOptional, IsString, IsDateString, IsEnum } from 'class-validator';
import { SprintStatus } from '@prisma/client';

export class CreateSprintRequestDto {
    @IsInt()
    @IsNotEmpty()
    projectId!: number;

    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsInt()
    @IsNotEmpty()
    sprintNo!: number;

    @IsOptional()
    @IsDateString()
    startDate?: string;

    @IsOptional()
    @IsDateString()
    endDate?: string;

    @IsOptional()
    @IsEnum(SprintStatus)
    status?: SprintStatus;
}
