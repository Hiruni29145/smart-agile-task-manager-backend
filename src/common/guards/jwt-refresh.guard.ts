import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ErrorCodes, Messages } from '../constants';
import { AuthenticatedUser } from '../interfaces';

@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh') {
    handleRequest<T = AuthenticatedUser>(err: Error | null, user: T | false, info: { name?: string } | undefined): T {
        if (err || !user) {
            if (info?.name === 'TokenExpiredError') {
                throw new UnauthorizedException({
                    code: ErrorCodes.AUTH_TOKEN_EXPIRED,
                    message: Messages.AUTH_TOKEN_EXPIRED,
                });
            }
            throw new UnauthorizedException({
                code: ErrorCodes.AUTH_REFRESH_TOKEN_INVALID,
                message: Messages.AUTH_TOKEN_INVALID,
            });
        }
        return user;
    }
}
