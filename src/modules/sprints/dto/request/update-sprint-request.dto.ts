import { IsInt, IsOptional, IsString, IsDateString, IsEnum } from 'class-validator';
import { SprintStatus } from '@prisma/client';

export class UpdateSprintRequestDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsInt()
    sprintNo?: number;

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
