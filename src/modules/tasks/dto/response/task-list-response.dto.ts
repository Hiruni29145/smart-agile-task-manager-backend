import { Expose, Type } from 'class-transformer';
import { TaskResponseDto } from './task-response.dto';
import { PaginationMeta } from '../../../../common/dto/pagination.dto';

export class TaskListResponseDto {
    @Expose()
    @Type(() => TaskResponseDto)
    items!: TaskResponseDto[];

    @Expose()
    meta!: PaginationMeta;

    constructor(partial: Partial<TaskListResponseDto>) {
        Object.assign(this, partial);
    }
}
