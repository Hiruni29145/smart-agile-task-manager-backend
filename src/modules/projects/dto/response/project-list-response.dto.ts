import { Exclude, Expose } from 'class-transformer';
import { PaginationMeta } from '../../../../common/dto/pagination.dto';
import { ProjectResponseDto } from './project-response.dto';

@Exclude()
export class ProjectListResponseDto {
    @Expose()
    items!: ProjectResponseDto[];

    @Expose()
    meta!: PaginationMeta;

    constructor(partial: Partial<ProjectListResponseDto>) {
        Object.assign(this, partial);
    }
}
