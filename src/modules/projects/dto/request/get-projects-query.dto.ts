import { IsEnum, IsOptional } from 'class-validator';
import { ProjectStatus } from '@prisma/client';
import { PaginationDto } from '../../../../common/dto/pagination.dto';

export class GetProjectsQueryDto extends PaginationDto {
    @IsOptional()
    @IsEnum(ProjectStatus)
    status?: ProjectStatus;
}
