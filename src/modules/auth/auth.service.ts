import { Injectable, ConflictException, UnauthorizedException, BadRequestException, Logger, } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import { Prisma, User } from '@prisma/client';
import { hashPassword, comparePassword } from '../../common/utils/password.util';
import { generateResetToken, getTokenExpiryDate, isTokenExpired } from '../../common/utils/token.util';
import { DeviceInfo } from '../../common/utils/device-info.util';
import { ErrorCodes, Messages } from '../../common/constants';
import { UserStatus, UserRole } from '../../common/enums';
import { RegisterRequestDto, LoginRequestDto, ChangePasswordRequestDto, RefreshTokenRequestDto, UpdateProfileRequestDto } from './dto/request';
import { LoginResponseDto, RegisterResponseDto, UserResponseDto, } from './dto/response';
import { SuccessResponseDto } from '../../common/dto';
import { Tokens } from './interfaces';
import { SessionService } from './session.service';
import { EmailService } from '../email/email.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '@prisma/client';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly sessionService: SessionService,
        private readonly emailService: EmailService,
        private readonly notificationsService: NotificationsService,
        private readonly auditService: AuditService,
    ) { }

    async register(registerDto: RegisterRequestDto): Promise<SuccessResponseDto> {
        const { email, password, firstName, lastName, phone, role, jobDescription } = registerDto;

        const existingUser = await this.prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });

        if (existingUser) {
            throw new ConflictException({
                code: ErrorCodes.AUTH_USER_EXISTS,
                message: Messages.AUTH_USER_EXISTS,
            });
        }

        const hashedPassword = await hashPassword(
            password,
            this.configService.getOrThrow<number>('BCRYPT_SALT_ROUNDS'),
        );

        const user = await this.prisma.user.create({
            data: {
                email: email.toLowerCase(),
                password: hashedPassword,
                firstName,
                lastName,
                phone,
                role: role || UserRole.DEVELOPER,
                jobDescription,
            },
        });

        await this.notificationsService.create(
            user.id,
            'Registration Successful',
            'You registered in successfully.',
            NotificationType.AUTH,
        );
        await this.emailService.sendAdminRegistrationEmail(user.email, user.firstName, password);

        this.logger.log(`User registered: ${user.email} by Admin`);

        return new SuccessResponseDto({
            message: Messages.AUTH_REGISTER_SUCCESS,
        });
    }

    async login(loginDto: LoginRequestDto, deviceInfo: DeviceInfo): Promise<LoginResponseDto> {
        const { email, password } = loginDto;

        const user = await this.prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });

        if (!user || user.deletedAt) {
            throw new UnauthorizedException({
                code: ErrorCodes.AUTH_INVALID_CREDENTIALS,
                message: Messages.AUTH_INVALID_CREDENTIALS,
            });
        }

        if (user.lockedUntil && new Date() < user.lockedUntil) {
            throw new UnauthorizedException({
                code: ErrorCodes.AUTH_ACCOUNT_LOCKED,
                message: Messages.AUTH_ACCOUNT_LOCKED,
            });
        }

        if (user.status !== UserStatus.ACTIVE) {
            const message =
                user.status === UserStatus.SUSPENDED
                    ? Messages.AUTH_ACCOUNT_SUSPENDED
                    : Messages.AUTH_ACCOUNT_INACTIVE;

            throw new UnauthorizedException({
                code:
                    user.status === UserStatus.SUSPENDED
                        ? ErrorCodes.AUTH_ACCOUNT_SUSPENDED
                        : ErrorCodes.AUTH_ACCOUNT_INACTIVE,
                message,
            });
        }

        let isPasswordValid = false;
        try {
            isPasswordValid = await comparePassword(password, user.password);
        } catch (error) {
            this.logger.error(`Invalid password hash format for user: ${user.email}`);
            throw new UnauthorizedException({
                code: ErrorCodes.AUTH_INVALID_CREDENTIALS,
                message: Messages.AUTH_INVALID_CREDENTIALS,
            });
        }

        if (!isPasswordValid) {
            const newAttempts = user.loginAttempts + 1;
            const updateData: Prisma.UserUpdateInput = { loginAttempts: newAttempts };

            if (newAttempts >= this.configService.getOrThrow<number>('MAX_LOGIN_ATTEMPTS')) {
                updateData.lockedUntil = new Date(
                    Date.now() + this.configService.getOrThrow<number>('LOCKOUT_DURATION_MINUTES') * 60 * 1000,
                );
                this.logger.warn(`Account locked due to failed attempts: ${user.email}`);
            }

            await this.prisma.user.update({
                where: { id: user.id },
                data: updateData,
            });

            throw new UnauthorizedException({
                code: ErrorCodes.AUTH_INVALID_CREDENTIALS,
                message: Messages.AUTH_INVALID_CREDENTIALS,
            });
        }

        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                loginAttempts: 0,
                lockedUntil: null,
                lastLoginAt: new Date(),
            },
        });

        const tokens = await this.generateTokens(user.id, user.email, user.role);
        const refreshExpiresIn = Number(this.configService.getOrThrow<number>('JWT_REFRESH_EXPIRATION_SECONDS'));
        await this.sessionService.createSession({
            userId: user.id,
            refreshToken: tokens.refreshToken,
            deviceInfo,
            expiresAt: new Date(Date.now() + refreshExpiresIn * 1000),
        });

        await this.notificationsService.create(
            user.id,
            'Login Successful',
            'You logged in successfully.',
            NotificationType.SUCCESS,
        );

        this.auditService.log({
            userId: user.id,
            action: 'USER_LOGIN',
            entity: 'User',
            entityId: user.id,
            ipAddress: deviceInfo.ipAddress,
            userAgent: deviceInfo.userAgent,
        });

        this.logger.log(`User logged in: ${user.email} from ${deviceInfo.deviceType} (${deviceInfo.ipAddress})`);

        return new LoginResponseDto({
            tokens,
            role: user.role as UserRole,
            message: Messages.AUTH_LOGIN_SUCCESS,
        });
    }

    async refreshTokens(userId: string, refreshToken: string, deviceInfo: DeviceInfo): Promise<Tokens> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user || user.deletedAt) {
            throw new UnauthorizedException({
                code: ErrorCodes.AUTH_REFRESH_TOKEN_INVALID,
                message: Messages.AUTH_TOKEN_INVALID,
            });
        }

        const session = await this.sessionService.validateSession(userId, refreshToken);
        const tokens = await this.generateTokens(user.id, user.email, user.role);

        const refreshExpiresIn = Number(this.configService.getOrThrow<number>('JWT_REFRESH_EXPIRATION_SECONDS'));
        await this.sessionService.createSession({
            userId: user.id,
            refreshToken: tokens.refreshToken,
            deviceInfo,
            expiresAt: new Date(Date.now() + refreshExpiresIn * 1000),
        });

        await this.sessionService.revokeSession(userId, session.sessionId);

        return tokens;
    }

    async logout(userId: string): Promise<SuccessResponseDto> {
        await this.sessionService.revokeAllSessions(userId);
        this.logger.log(`User logged out from all devices: ${userId}`);
        return new SuccessResponseDto({ message: Messages.AUTH_LOGOUT_SUCCESS });
    }

    async forgotPassword(email: string): Promise<SuccessResponseDto> {
        const user = await this.prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });

        if (!user || user.deletedAt) {
            // Security: Don't reveal if email exists or not
            return new SuccessResponseDto({ message: Messages.AUTH_PASSWORD_RESET_REQUESTED });
        }

        const resetToken = generateResetToken();
        const resetExpiry = getTokenExpiryDate(60); // 1 hour

        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                passwordResetToken: resetToken,
                passwordResetExpiry: resetExpiry,
            },
        });

        await this.emailService.sendPasswordResetEmail(
            user.email,
            resetToken,
            user.firstName,
        );

        await this.notificationsService.create(
            user.id,
            'Password Reset Requested',
            'A password reset was link sent to your email address.',
            NotificationType.AUTH,
        );

        this.logger.log(`Password reset requested for: ${email}`);
        return new SuccessResponseDto({ message: Messages.AUTH_PASSWORD_RESET_REQUESTED });
    }

    async resetPassword(token: string, newPassword: string): Promise<SuccessResponseDto> {
        const user = await this.prisma.user.findFirst({
            where: { passwordResetToken: token },
        });

        if (!user) {
            throw new BadRequestException({
                code: ErrorCodes.AUTH_RESET_TOKEN_INVALID,
                message: Messages.AUTH_RESET_TOKEN_INVALID,
            });
        }

        if (isTokenExpired(user.passwordResetExpiry)) {
            throw new BadRequestException({
                code: ErrorCodes.AUTH_RESET_TOKEN_EXPIRED,
                message: Messages.AUTH_RESET_TOKEN_EXPIRED,
            });
        }

        const hashedPassword = await hashPassword(
            newPassword,
            this.configService.getOrThrow<number>('BCRYPT_SALT_ROUNDS'),
        );

        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                passwordResetToken: null,
                passwordResetExpiry: null,
            },
        });

        await this.sessionService.revokeAllSessions(user.id);

        await this.notificationsService.create(
            user.id,
            'Password Reset Successful',
            'Your password has been reset successfully.',
            NotificationType.AUTH,
        );

        this.logger.log(`Password reset for user: ${user.email}`);
        return new SuccessResponseDto({ message: Messages.AUTH_PASSWORD_RESET_SUCCESS });
    }

    async changePassword(
        userId: string,
        changePasswordDto: ChangePasswordRequestDto,
    ): Promise<SuccessResponseDto> {
        const { currentPassword, newPassword } = changePasswordDto;

        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new UnauthorizedException({
                code: ErrorCodes.USER_NOT_FOUND,
                message: Messages.USER_NOT_FOUND,
            });
        }

        const isPasswordValid = await comparePassword(currentPassword, user.password);

        if (!isPasswordValid) {
            throw new BadRequestException({
                code: ErrorCodes.AUTH_PASSWORD_MISMATCH,
                message: Messages.AUTH_PASSWORD_MISMATCH,
            });
        }

        const hashedPassword = await hashPassword(
            newPassword,
            this.configService.getOrThrow<number>('BCRYPT_SALT_ROUNDS'),
        );

        await this.prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });

        await this.sessionService.revokeAllSessions(userId);

        await this.notificationsService.create(
            user.id,
            'Password Changed',
            'Your password has been changed successfully.',
            NotificationType.AUTH,
        );

        this.logger.log(`Password changed for user: ${user.email}`);
        return new SuccessResponseDto({ message: Messages.AUTH_PASSWORD_CHANGE_SUCCESS });
    }

    async updateProfile(userId: string, dto: UpdateProfileRequestDto): Promise<SuccessResponseDto> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user || user.deletedAt) {
            throw new UnauthorizedException({
                code: ErrorCodes.USER_NOT_FOUND,
                message: Messages.USER_NOT_FOUND,
            });
        }

        const updateData: Prisma.UserUpdateInput = {
            firstName: dto.firstName,
            lastName: dto.lastName,
            phone: dto.phoneNumber,
            avatar: dto.avatar,
        };

        if (Object.keys(updateData).length === 0) {
            return new SuccessResponseDto({ message: Messages.USER_UPDATED });
        }

        await this.prisma.user.update({
            where: { id: userId },
            data: updateData,
        });

        await this.notificationsService.create(
            user.id,
            'Profile Updated',
            'Your profile details have been updated successfully.',
            NotificationType.AUTH,
        );

        this.logger.log(`Profile updated for user: ${user.email}`);
        return new SuccessResponseDto({ message: Messages.USER_UPDATED });
    }

    async getProfile(userId: string): Promise<UserResponseDto> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user || user.deletedAt) {
            throw new UnauthorizedException({
                code: ErrorCodes.USER_NOT_FOUND,
                message: Messages.USER_NOT_FOUND,
            });
        }

        return new UserResponseDto({
            ...this.mapUserToResponse(user),
            message: Messages.USER_FOUND,
        });
    }

    // Helper methods
    private async generateTokens(
        userId: string,
        email: string,
        role: string,
    ): Promise<Tokens> {
        const payload = {
            sub: userId,
            email,
            role,
        };

        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
                expiresIn: Number(this.configService.getOrThrow<number>('JWT_ACCESS_EXPIRATION_SECONDS')),
            }),
            this.jwtService.signAsync(payload, {
                secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
                expiresIn: Number(this.configService.getOrThrow<number>('JWT_REFRESH_EXPIRATION_SECONDS')),
            }),
        ]);

        return { accessToken, refreshToken };
    }

    private mapUserToResponse(user: User): UserResponseDto {
        return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            avatar: user.avatar,
            role: user.role,
            status: user.status,
            createdAt: user.createdAt,
        };
    }
}
