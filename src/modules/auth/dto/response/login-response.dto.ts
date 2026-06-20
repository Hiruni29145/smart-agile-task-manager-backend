import { Expose, Type } from 'class-transformer';
import { UserRole } from '@prisma/client';

export class LoginTokensDto {
    @Expose()
    accessToken!: string;

    @Expose()
    refreshToken!: string;
}

export class LoginResponseDto {
    @Expose()
    @Type(() => LoginTokensDto)
    tokens!: LoginTokensDto;

    @Expose()
    role!: UserRole;

    @Expose()
    message?: string;

    constructor(partial: Partial<LoginResponseDto>) {
        Object.assign(this, partial);
    }
}
