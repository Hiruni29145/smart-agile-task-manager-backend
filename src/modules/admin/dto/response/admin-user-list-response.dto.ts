import { Exclude, Expose, Type } from 'class-transformer';
import { AdminUserResponseDto } from './admin-user-response.dto';

@Exclude()
export class AdminUserListResponseDto {
    @Expose()
    @Type(() => AdminUserResponseDto)
    users!: AdminUserResponseDto[];

    @Expose()
    total!: number;

    @Expose()
    page!: number;

    @Expose()
    limit!: number;

    @Expose()
    totalPages!: number;

    @Expose()
    message!: string;

    constructor(partial: Partial<AdminUserListResponseDto>) {
        Object.assign(this, partial);
    }
}
