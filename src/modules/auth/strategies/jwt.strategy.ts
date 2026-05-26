import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../../database/prisma.service';
import { SessionService } from '../session.service';
import { JwtPayload } from '../../../common/interfaces';
import { ErrorCodes, Messages } from '../../../common/constants';
import { UserStatus } from '../../../common/enums';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(
        configService: ConfigService,
        private readonly prisma: PrismaService,
        private readonly sessionService: SessionService,
    ) {
        const secret = configService.get<string>('JWT_ACCESS_SECRET');
        if (!secret) {
            throw new Error('JWT_ACCESS_SECRET is not configured');
        }

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: secret,
        });
    }

    async validate(payload: JwtPayload) {
        const user = await this.prisma.user.findUnique({
            where: { id: payload.sub },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                status: true,
                deletedAt: true,
            },
        });

        if (!user || user.deletedAt) {
            throw new UnauthorizedException({
                code: ErrorCodes.AUTH_TOKEN_INVALID,
                message: Messages.AUTH_UNAUTHORIZED,
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

        // Check if user has an active session (blocks access after logout)
        const hasActiveSession = await this.sessionService.hasActiveSession(user.id);
        if (!hasActiveSession) {
            throw new UnauthorizedException({
                code: ErrorCodes.AUTH_SESSION_INVALID,
                message: Messages.AUTH_SESSION_INVALID,
            });
        }

        return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            status: user.status,
        };
    }
}
