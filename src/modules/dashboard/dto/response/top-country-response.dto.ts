import { Expose } from 'class-transformer';

export class TopCountryResponseDto {
    @Expose()
    country!: string;

    @Expose()
    activeUsers!: number;

    constructor(partial: Partial<TopCountryResponseDto>) {
        Object.assign(this, partial);
    }
}
