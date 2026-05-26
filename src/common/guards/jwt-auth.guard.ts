import { Injectable, ExecutionContext, UnauthorizedException, } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { ErrorCodes, Messages } from '../constants';
import { AuthenticatedUser } from '../interfaces';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(private reflector: Reflector) {
        super();
    }

    canActivate(context: ExecutionContext) {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (isPublic) {
            return true;
        }

        return super.canActivate(context);
    }

    handleRequest<T = AuthenticatedUser>(err: Error | null, user: T | false, info: { name?: string } | undefined): T {
        if (err || !user) {
            if (info?.name === 'TokenExpiredError') {
                throw new UnauthorizedException({
                    code: ErrorCodes.AUTH_TOKEN_EXPIRED,
                    message: Messages.AUTH_TOKEN_EXPIRED,
                });
            }
            throw new UnauthorizedException({
                code: ErrorCodes.AUTH_TOKEN_INVALID,
                message: Messages.AUTH_UNAUTHORIZED,
            });
        }
        return user;
    }
}
