import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus, Logger, } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';
import { ApiResponse } from '../dto';
import { ErrorCodes, Messages } from '../constants';

/**
 * Prisma Exception Filter
 * 
 * Handles Prisma-specific database errors and transforms them into
 * user-friendly error responses.
 */
@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(PrismaExceptionFilter.name);

    catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message: string = Messages.INTERNAL_ERROR;
        let code: string = ErrorCodes.DATABASE_ERROR;
        let details: Record<string, unknown> | undefined = undefined;

        switch (exception.code) {
            case 'P2002': {
                // Unique constraint violation
                status = HttpStatus.CONFLICT;
                const target = exception.meta?.target as string[] | undefined;
                const field = target?.[0] || 'field';
                message = `A record with this ${field} already exists`;
                code = ErrorCodes.USER_EMAIL_EXISTS;
                details = { field };
                break;
            }
            case 'P2025': {
                // Record not found
                status = HttpStatus.NOT_FOUND;
                message = 'Record not found';
                code = ErrorCodes.USER_NOT_FOUND;
                break;
            }
            case 'P2003': {
                // Foreign key constraint failed
                status = HttpStatus.BAD_REQUEST;
                message = 'Related record not found';
                code = ErrorCodes.VALIDATION_FAILED;
                break;
            }
            case 'P2014': {
                // Required relation violation
                status = HttpStatus.BAD_REQUEST;
                message = 'Required relation constraint violated';
                code = ErrorCodes.VALIDATION_FAILED;
                break;
            }
            default:
                this.logger.error(
                    `Prisma error ${exception.code}: ${exception.message}`,
                    exception.stack,
                );
        }

        const errorResponse = ApiResponse.error(
            code,
            message,
            status,
            request.path,
            { details },
        );

        response.status(status).json(errorResponse);
    }
}
