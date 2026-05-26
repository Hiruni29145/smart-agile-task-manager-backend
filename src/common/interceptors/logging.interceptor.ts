import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger, } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    private readonly logger = new Logger('HTTP');

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest<Request>();
        const response = context.switchToHttp().getResponse<Response>();
        const { method, originalUrl, ip } = request;
        const userAgent = request.get('user-agent') || '';

        const now = Date.now();

        return next.handle().pipe(
            tap({
                next: () => {
                    const { statusCode } = response;
                    const contentLength = response.get('content-length') || 0;
                    const responseTime = Date.now() - now;

                    this.logger.log(
                        `${method} ${originalUrl} ${statusCode} ${contentLength} - ${responseTime}ms - ${ip} - ${userAgent}`,
                    );
                },
                error: (error) => {
                    const responseTime = Date.now() - now;
                    this.logger.error(
                        `${method} ${originalUrl} - ${responseTime}ms - ${ip} - ${error.message}`,
                    );
                },
            }),
        );
    }
}
