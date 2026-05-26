import { Expose, Type } from 'class-transformer';

export class RegisterTokensDto {
    @Expose()
    accessToken!: string;

    @Expose()
    refreshToken!: string;
}

export class RegisterResponseDto {
    @Expose()
    @Type(() => RegisterTokensDto)
    tokens!: RegisterTokensDto;

    @Expose()
    message?: string;

    constructor(partial: Partial<RegisterResponseDto>) {
        Object.assign(this, partial);
    }
}
