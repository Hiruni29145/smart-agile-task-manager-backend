import { IsEnum, IsOptional } from 'class-validator';
import { TaskStatus, TaskPriority, TaskType } from '@prisma/client';
import { PaginationDto } from '../../../../common/dto/pagination.dto';

export class GetTasksQueryDto extends PaginationDto {
    @IsOptional()
    @IsEnum(TaskStatus)
    status?: TaskStatus;

    @IsOptional()
    @IsEnum(TaskPriority)
    priority?: TaskPriority;

    @IsOptional()
    @IsEnum(TaskType)
    type?: TaskType;
}
