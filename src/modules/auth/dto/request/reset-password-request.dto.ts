import { IsNotEmpty, IsString, Matches, MinLength, Validate, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';

@ValidatorConstraint({ name: 'MatchPassword', async: false })
export class MatchPasswordConstraint implements ValidatorConstraintInterface {
    validate(confirmPassword: string, args: ValidationArguments) {
        const object = args.object as { newPassword: string };
        return confirmPassword === object.newPassword;
    }

    defaultMessage() {
        return 'Confirm password must match new password';
    }
}

export class ResetPasswordRequestDto {
    @IsString()
    @IsNotEmpty({ message: 'Reset token is required' })
    token!: string;

    @IsString()
    @IsNotEmpty({ message: 'New password is required' })
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    @Matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        {
            message:
                'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        },
    )
    newPassword!: string;

    @IsString()
    @IsNotEmpty({ message: 'Confirm password is required' })
    @Validate(MatchPasswordConstraint)
    confirmPassword!: string;
}
