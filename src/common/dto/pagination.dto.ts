import { Type, Expose, Exclude } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class PaginationDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(50)
    limit?: number;
}

export class PaginationMeta {
    @Expose()
    page!: number;

    @Expose()
    limit!: number;

    @Expose()
    total!: number;

    @Expose()
    totalPages!: number;

    @Expose()
    hasNextPage!: boolean;

    @Expose()
    hasPreviousPage!: boolean;
}

@Expose()
export class PaginatedResponse<T> {
    @Expose()
    items: T[];

    @Expose()
    meta: PaginationMeta;

    constructor(items: T[], total: number, page: number, limit: number) {
        this.items = items;
        this.meta = {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasNextPage: page < Math.ceil(total / limit),
            hasPreviousPage: page > 1,
        };
    }
}
