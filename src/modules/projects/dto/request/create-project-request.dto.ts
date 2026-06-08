import { IsNotEmpty, IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';
import { ProjectStatus } from '@prisma/client';

export class CreateProjectRequestDto {
    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsString()
    @IsNotEmpty()
    key!: string;

    @IsOptional()
    @IsDateString()
    deadline?: string;
}
