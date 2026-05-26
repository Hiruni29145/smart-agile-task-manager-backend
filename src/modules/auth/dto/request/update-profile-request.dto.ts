import { IsString, IsOptional, IsUrl } from 'class-validator';

export class UpdateProfileRequestDto {
    @IsOptional()
    @IsString()
    firstName?: string;

    @IsOptional()
    @IsString()
    lastName?: string;

    @IsOptional()
    @IsString()
    phoneNumber?: string;

    @IsOptional()
    @IsUrl()
    avatar?: string;
}
