import { Expose, Type } from 'class-transformer';
import { SprintResponseDto } from './sprint-response.dto';
import { PaginationMeta } from '../../../../common/dto/pagination.dto';

export class SprintListResponseDto {
    @Expose()
    @Type(() => SprintResponseDto)
    items!: SprintResponseDto[];

    @Expose()
    meta!: PaginationMeta;

    constructor(partial: Partial<SprintListResponseDto>) {
        Object.assign(this, partial);
    }
}
