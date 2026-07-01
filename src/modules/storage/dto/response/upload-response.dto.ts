import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class UploadResponseDto {
    @Expose()
    url!: string;

    @Expose()
    path!: string;

    constructor(partial: Partial<UploadResponseDto>) {
        Object.assign(this, partial);
    }
}
