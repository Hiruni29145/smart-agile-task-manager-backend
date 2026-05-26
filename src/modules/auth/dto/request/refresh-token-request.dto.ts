import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenRequestDto {
    @IsString()
    @IsNotEmpty({ message: 'Refresh token is required' })
    refreshToken!: string;
}
