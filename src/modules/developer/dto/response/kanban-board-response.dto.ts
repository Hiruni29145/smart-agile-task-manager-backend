import { Expose, Type } from 'class-transformer';
import { TaskResponseDto } from '../../../tasks/dto';

export class KanbanBoardResponseDto {
    @Expose()
    @Type(() => TaskResponseDto)
    TODO!: TaskResponseDto[];

    @Expose()
    @Type(() => TaskResponseDto)
    IN_PROGRESS!: TaskResponseDto[];

    @Expose()
    @Type(() => TaskResponseDto)
    REVIEW!: TaskResponseDto[];

    @Expose()
    @Type(() => TaskResponseDto)
    DONE!: TaskResponseDto[];

    constructor(partial: Partial<KanbanBoardResponseDto>) {
        Object.assign(this, partial);
    }
}
