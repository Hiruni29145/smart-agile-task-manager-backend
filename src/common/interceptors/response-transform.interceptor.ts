import { Injectable, NestInterceptor, ExecutionContext, CallHandler, } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request } from 'express';

/**
 * Standard API response structure
 */
interface StandardResponse<T> {
    success: boolean;
    statusCode: number;
    message: string;
    data: T | null;
    timestamp: string;
    path: string;
}

/**
 * Response Transform Interceptor
 * 
 * Transforms all successful responses into a consistent format:
 * {
 *   success: true,
 *   statusCode: 200,
 *   message: "Success",
 *   data: { ... } | null,
 *   timestamp: "2026-01-30T16:30:00.000Z",
 *   path: "/api/v1/users"
 * }
 */
@Injectable()
export class ResponseTransformInterceptor<T>
    implements NestInterceptor<T, StandardResponse<T>> {
    intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Observable<StandardResponse<T>> {
        const request = context.switchToHttp().getRequest<Request>();
        const statusCode = context.switchToHttp().getResponse().statusCode;

        return next.handle().pipe(
            map((responseData: unknown) => {
                // Handle null/undefined responses (e.g., 204 No Content)
                if (responseData === null || responseData === undefined) {
                    return {
                        success: true,
                        statusCode,
                        message: 'Success',
                        data: null,
                        timestamp: new Date().toISOString(),
                        path: request.url,
                    };
                }

                // Extract message if present in response
                const message = (responseData as any)?.message || 'Success';

                // Build data payload
                let data: T | null;

                if (typeof responseData === 'object' && responseData !== null) {
                    const responseObj = responseData as Record<string, any>;
                    // Remove 'message' from data to avoid duplication
                    const { message: _, ...rest } = responseObj;

                    // If only message was in response, data is null
                    // If other fields exist, use them as data
                    data = Object.keys(rest).length > 0 ? (rest as T) : null;
                } else {
                    // Primitive values (string, number, etc.)
                    data = responseData as T;
                }

                return {
                    success: true,
                    statusCode,
                    message,
                    data,
                    timestamp: new Date().toISOString(),
                    path: request.url,
                };
            }),
        );
    }
}
