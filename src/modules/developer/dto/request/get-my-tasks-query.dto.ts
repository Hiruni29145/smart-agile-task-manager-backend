import { IsEnum, IsOptional, IsString } from 'class-validator';
import { TaskStatus } from '@prisma/client';
import { PaginationDto } from '../../../../common/dto/pagination.dto';

export class GetMyTasksQueryDto extends PaginationDto {
    @IsOptional()
    @IsEnum(TaskStatus)
    status?: TaskStatus;

    @IsOptional()
    @IsString()
    search?: string;
}
