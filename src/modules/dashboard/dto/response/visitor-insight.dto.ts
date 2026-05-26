import { Expose } from 'class-transformer';

export class VisitorInsightDto {
    @Expose()
    date!: string;

    @Expose()
    activeUsers!: number;

    constructor(partial: Partial<VisitorInsightDto>) {
        Object.assign(this, partial);
    }
}
