import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger, BadRequestException, } from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiResponse, FieldError } from '../dto';
import { ErrorCodes, Messages } from '../constants';

/**
 * Global Exception Filter
 * 
 * Catches all exceptions and transforms them into a consistent error response format:
 * {
 *   success: false,
 *   statusCode: 400,
 *   message: "Validation failed",
 *   data: null,
 *   error: {
 *     code: "VAL001",
 *     fields: [{ field: "email", message: "Invalid email format" }]
 *   },
 *   timestamp: "2026-01-30T16:30:00.000Z",
 *   path: "/api/v1/auth/register"
 * }
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(GlobalExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message: string = Messages.INTERNAL_ERROR;
        let code: string = ErrorCodes.INTERNAL_ERROR;
        let fields: FieldError[] | undefined = undefined;
        let retryAfter: number | undefined = undefined;
        let details: Record<string, unknown> | undefined = undefined;

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();

            if (typeof exceptionResponse === 'string') {
                message = exceptionResponse;
                code = this.getCodeFromStatus(status);
            } else if (typeof exceptionResponse === 'object') {
                const res = exceptionResponse as Record<string, unknown>;

                // Extract message
                message = this.extractMessage(res, message);

                // Extract error code
                code = (res.code as string) || this.getCodeFromStatus(status);

                // Handle validation errors (BadRequestException from ValidationPipe)
                if (exception instanceof BadRequestException) {
                    const validationErrors = this.extractValidationErrors(res);
                    if (validationErrors.length > 0) {
                        fields = validationErrors;
                        code = ErrorCodes.VALIDATION_FAILED;
                        message = Messages.VALIDATION_FAILED;
                    }
                }

                // Extract retry-after for rate limiting
                if (status === HttpStatus.TOO_MANY_REQUESTS) {
                    retryAfter = (res.retryAfter as number) || 60;
                }

                // Extract additional details
                if (res.details && typeof res.details === 'object') {
                    details = res.details as Record<string, unknown>;
                }
            }
        } else if (exception instanceof Error) {
            message = exception.message;
            this.logger.error(
                `Unhandled exception: ${exception.message}`,
                exception.stack,
            );
        }

        const errorResponse = ApiResponse.error(
            code,
            message,
            status,
            request.path,
            { fields, retryAfter, details },
        );

        response.status(status).json(errorResponse);
    }

    /**
     * Extract message from exception response
     */
    private extractMessage(res: Record<string, unknown>, defaultMessage: string): string {
        if (typeof res.message === 'string') {
            return res.message;
        }
        if (Array.isArray(res.message) && res.message.length > 0) {
            // For validation errors, use the first message or a generic one
            return typeof res.message[0] === 'string'
                ? res.message[0]
                : Messages.VALIDATION_FAILED;
        }
        return defaultMessage;
    }

    /**
     * Extract and format validation errors from ValidationPipe
     */
    private extractValidationErrors(res: Record<string, unknown>): FieldError[] {
        const errors: FieldError[] = [];

        // Handle class-validator message array format
        if (Array.isArray(res.message)) {
            res.message.forEach((msg: unknown) => {
                if (typeof msg === 'string') {
                    // Parse "fieldName should not be empty" format
                    const match = msg.match(/^(\w+)\s+(.+)$/);
                    if (match) {
                        errors.push({
                            field: match[1],
                            message: msg,
                        });
                    } else {
                        errors.push({
                            field: 'unknown',
                            message: msg,
                        });
                    }
                } else if (typeof msg === 'object' && msg !== null) {
                    const errorObj = msg as Record<string, unknown>;
                    if (errorObj.property && errorObj.constraints) {
                        const constraints = errorObj.constraints as Record<string, string>;
                        const messages = Object.values(constraints);
                        errors.push({
                            field: errorObj.property as string,
                            message: messages[0] || 'Validation error',
                            value: errorObj.value,
                        });
                    }
                }
            });
        }

        // Handle errors array format (from some validators)
        if (Array.isArray(res.errors)) {
            res.errors.forEach((err: unknown) => {
                if (typeof err === 'object' && err !== null) {
                    const errorObj = err as Record<string, unknown>;
                    errors.push({
                        field: (errorObj.field || errorObj.property || 'unknown') as string,
                        message: (errorObj.message || 'Validation error') as string,
                        value: errorObj.value,
                    });
                }
            });
        }

        return errors;
    }

    /**
     * Map HTTP status codes to error codes
     */
    private getCodeFromStatus(status: number): string {
        switch (status) {
            case HttpStatus.BAD_REQUEST:
                return ErrorCodes.VALIDATION_FAILED;
            case HttpStatus.UNAUTHORIZED:
                return ErrorCodes.AUTH_UNAUTHORIZED;
            case HttpStatus.FORBIDDEN:
                return ErrorCodes.FORBIDDEN;
            case HttpStatus.NOT_FOUND:
                return ErrorCodes.USER_NOT_FOUND;
            case HttpStatus.CONFLICT:
                return ErrorCodes.USER_EMAIL_EXISTS;
            case HttpStatus.TOO_MANY_REQUESTS:
                return ErrorCodes.RATE_LIMIT_EXCEEDED;
            default:
                return ErrorCodes.INTERNAL_ERROR;
        }
    }
}
