import { Expose } from 'class-transformer';

export class AnalyticsResponseDto {
    @Expose()
    day!: string;

    @Expose()
    count!: number;

    constructor(partial: Partial<AnalyticsResponseDto>) {
        Object.assign(this, partial);
    }
}
