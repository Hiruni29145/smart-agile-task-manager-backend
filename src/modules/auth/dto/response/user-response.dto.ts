import { Expose } from 'class-transformer';

export class UserResponseDto {
    @Expose()
    id!: string;

    @Expose()
    email!: string;

    @Expose()
    firstName!: string;

    @Expose()
    lastName!: string;

    @Expose()
    phone?: string | null;

    @Expose()
    avatar?: string | null;

    @Expose()
    role!: string;

    @Expose()
    status!: string;

    @Expose()
    createdAt!: Date;

    @Expose()
    message?: string;

    constructor(partial: Partial<UserResponseDto>) {
        Object.assign(this, partial);
    }
}
