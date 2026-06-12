import { Expose } from 'class-transformer';

export class GlobalDistributionResponseDto {
    @Expose()
    feature!: number;

    @Expose()
    bug!: number;

    @Expose()
    chore!: number;

    @Expose()
    spike!: number;

    constructor(partial: Partial<GlobalDistributionResponseDto>) {
        Object.assign(this, partial);
    }
}
