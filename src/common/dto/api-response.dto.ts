/**
 * Represents a single field validation error
 * Used for structured form validation error responses
 */
export class FieldError {
    /** The field name that has the validation error */
    field!: string;

    /** Human-readable error message for this field */
    message!: string;

    /** The invalid value that was provided (optional) */
    value?: unknown;
}

/**
 * Structured error details for API error responses
 */
export class ErrorDetail {
    /** Machine-readable error code for programmatic handling */
    code!: string;

    /** Array of field-level validation errors (for form validation) */
    fields?: FieldError[];

    /** Seconds to wait before retrying (for rate limit errors) */
    retryAfter?: number;

    /** Additional error details or context */
    details?: Record<string, unknown>;
}

/**
 * Standard API Response wrapper
 * All API responses follow this consistent structure
 * 
 * @example Success with data:
 * ```json
 * {
 *   "success": true,
 *   "statusCode": 200,
 *   "message": "User retrieved successfully",
 *   "data": { "id": "123", "email": "user@example.com" },
 *   "timestamp": "2026-01-30T16:30:00.000Z",
 *   "path": "/api/v1/users/123"
 * }
 * ```
 * 
 * @example Error with validation fields:
 * ```json
 * {
 *   "success": false,
 *   "statusCode": 400,
 *   "message": "Validation failed",
 *   "data": null,
 *   "error": {
 *     "code": "VAL001",
 *     "fields": [{ "field": "email", "message": "Invalid email format" }]
 *   },
 *   "timestamp": "2026-01-30T16:30:00.000Z",
 *   "path": "/api/v1/auth/register"
 * }
 * ```
 */
export class ApiResponse<T> {
    /** Indicates if the request was successful */
    success!: boolean;

    /** HTTP status code */
    statusCode!: number;

    /** Human-readable response message */
    message!: string;

    /** Response payload (null for errors or message-only responses) */
    data?: T | null;

    /** Error details (only present for error responses) */
    error?: ErrorDetail;

    /** ISO 8601 timestamp of when the response was generated */
    timestamp!: string;

    /** Request path that generated this response */
    path!: string;

    constructor(partial: Partial<ApiResponse<T>>) {
        Object.assign(this, partial);
        this.timestamp = partial.timestamp || new Date().toISOString();
    }

    /**
     * Create a success response with data
     */
    static success<T>(
        data: T,
        message = 'Success',
        statusCode = 200,
        path = '',
    ): ApiResponse<T> {
        return new ApiResponse({
            success: true,
            statusCode,
            message,
            data,
            path,
            timestamp: new Date().toISOString(),
        });
    }

    /**
     * Create a success response with message only (no data)
     */
    static message(
        message: string,
        statusCode = 200,
        path = '',
    ): ApiResponse<null> {
        return new ApiResponse({
            success: true,
            statusCode,
            message,
            data: null,
            path,
            timestamp: new Date().toISOString(),
        });
    }

    /**
     * Create an error response
     */
    static error(
        code: string,
        message: string,
        statusCode = 400,
        path = '',
        options?: {
            fields?: FieldError[];
            retryAfter?: number;
            details?: Record<string, unknown>;
        },
    ): ApiResponse<null> {
        const error: ErrorDetail = { code };

        if (options?.fields?.length) {
            error.fields = options.fields;
        }
        if (options?.retryAfter) {
            error.retryAfter = options.retryAfter;
        }
        if (options?.details && Object.keys(options.details).length > 0) {
            error.details = options.details;
        }

        return new ApiResponse({
            success: false,
            statusCode,
            message,
            data: null,
            error,
            path,
            timestamp: new Date().toISOString(),
        });
    }
}
