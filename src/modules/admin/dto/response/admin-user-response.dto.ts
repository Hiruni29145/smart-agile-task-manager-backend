import { Exclude, Expose } from 'class-transformer';
import { UserRole, UserStatus } from '@prisma/client';

@Exclude()
export class AdminUserResponseDto {
    @Expose()
    id!: string;

    @Expose()
    email!: string;

    @Expose()
    firstName!: string;

    @Expose()
    lastName!: string;

    @Expose()
    phone!: string | null;

    @Expose()
    avatar!: string | null;

    @Expose()
    role!: UserRole;

    @Expose()
    status!: UserStatus;

    @Expose()
    lastLoginAt!: Date | null;

    @Expose()
    createdAt!: Date;

    constructor(partial: Partial<AdminUserResponseDto>) {
        Object.assign(this, partial);
    }
}
