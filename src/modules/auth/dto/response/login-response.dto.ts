import { Expose, Type } from 'class-transformer';

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
    message?: string;

    constructor(partial: Partial<LoginResponseDto>) {
        Object.assign(this, partial);
    }
}
