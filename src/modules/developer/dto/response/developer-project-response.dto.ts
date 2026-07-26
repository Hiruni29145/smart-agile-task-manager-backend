import { Expose, Type } from 'class-transformer';

export class DeveloperProjectDto {
    @Expose()
    id!: number;

    @Expose()
    name!: string;
}

export class DeveloperProjectListResponseDto {
    @Expose()
    @Type(() => DeveloperProjectDto)
    items!: DeveloperProjectDto[];

    constructor(partial: Partial<DeveloperProjectListResponseDto>) {
        Object.assign(this, partial);
    }
}
