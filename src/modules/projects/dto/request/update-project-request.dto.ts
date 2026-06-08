import { IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';
import { ProjectStatus } from '@prisma/client';

export class UpdateProjectRequestDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    key?: string;

    @IsOptional()
    @IsEnum(ProjectStatus)
    status?: ProjectStatus;

    @IsOptional()
    @IsDateString()
    deadline?: string;
}
