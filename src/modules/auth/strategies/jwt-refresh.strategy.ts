import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptionsWithRequest } from 'passport-jwt';
import { Request } from 'express';
import { PrismaService } from '../../../database/prisma.service';
import { JwtPayload } from '../../../common/interfaces';
import { ErrorCodes, Messages } from '../../../common/constants';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
    constructor(
        configService: ConfigService,
        private readonly prisma: PrismaService,
    ) {
        const secret = configService.get<string>('JWT_REFRESH_SECRET');
        if (!secret) {
            throw new Error('JWT_REFRESH_SECRET is not configured');
        }

        const options: StrategyOptionsWithRequest = {
            jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
            ignoreExpiration: false,
            secretOrKey: secret,
            passReqToCallback: true,
        };

        super(options);
    }

    async validate(req: Request, payload: JwtPayload) {
        const refreshToken = req.body.refreshToken;

        const user = await this.prisma.user.findUnique({
            where: { id: payload.sub },
            select: {
                id: true,
                email: true,
                deletedAt: true,
            },
        });

        if (!user || user.deletedAt) {
            throw new UnauthorizedException({
                code: ErrorCodes.AUTH_REFRESH_TOKEN_INVALID,
                message: Messages.AUTH_TOKEN_INVALID,
            });
        }

        return {
            id: user.id,
            email: user.email,
            refreshToken: refreshToken,
        };
    }
}
