import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MinLength, IsEnum } from 'class-validator';
import { UserRole } from '@prisma/client';

export class RegisterRequestDto {
    @IsEmail({}, { message: 'Please provide a valid email address' })
    @IsNotEmpty({ message: 'Email is required' })
    email!: string;

    @IsString()
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    @Matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        {
            message:
                'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        },
    )
    password!: string;

    @IsString()
    @IsNotEmpty({ message: 'First name is required' })
    firstName!: string;

    @IsString()
    @IsNotEmpty({ message: 'Last name is required' })
    lastName!: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsEnum(UserRole, { message: 'Role must be a valid UserRole (e.g., DEVELOPER, ADMIN)' })
    @IsNotEmpty({ message: 'Role is required' })
    role!: UserRole;
}
