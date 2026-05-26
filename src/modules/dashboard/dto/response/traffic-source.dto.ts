import { Expose } from 'class-transformer';

export class TrafficSourceDto {
    @Expose()
    source!: string;

    @Expose()
    activeUsers!: number;

    constructor(partial: Partial<TrafficSourceDto>) {
        Object.assign(this, partial);
    }
}
