import { Injectable, NestInterceptor, ExecutionContext, CallHandler, } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class BigIntInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
        return next.handle().pipe(
            map((data) => this.transformBigInt(data)),
        );
    }

    private transformBigInt(data: unknown): unknown {
        if (data === null || data === undefined) {
            return data;
        }

        if (typeof data === 'bigint') {
            return data.toString();
        }

        if (Array.isArray(data)) {
            return data.map((item) => this.transformBigInt(item));
        }


        if (data instanceof Date) {
            return data;
        }

        if (typeof data === 'object') {
            const transformed: Record<string, unknown> = {};
            for (const key of Object.keys(data as Record<string, unknown>)) {
                transformed[key] = this.transformBigInt((data as Record<string, unknown>)[key]);
            }
            return transformed;
        }

        return data;
    }
}
