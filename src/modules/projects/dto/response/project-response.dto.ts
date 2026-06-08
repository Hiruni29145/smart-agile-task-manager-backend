import { ProjectStatus } from '@prisma/client';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class ProjectResponseDto {
    @Expose()
    id!: number;

    @Expose()
    name!: string;

    @Expose()
    description!: string | null;

    @Expose()
    key!: string;

    @Expose()
    status!: ProjectStatus;

    @Expose()
    deadline!: Date | null;

    @Expose()
    createdById!: string;

    @Expose()
    createdAt!: Date;

    @Expose()
    updatedAt!: Date;

    constructor(partial: Partial<ProjectResponseDto>) {
        Object.assign(this, partial);
    }
}
