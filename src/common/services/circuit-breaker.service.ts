import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import CircuitBreaker from 'opossum';

export interface CircuitBreakerOptions {
    timeout?: number;
    errorThresholdPercentage?: number;
    resetTimeout?: number;
    volumeThreshold?: number;
}

const DEFAULT_OPTIONS: CircuitBreakerOptions = {
    timeout: 10000,
    errorThresholdPercentage: 50,
    resetTimeout: 30000,
    volumeThreshold: 5,
};

@Injectable()
export class CircuitBreakerService implements OnModuleInit {
    private readonly logger = new Logger(CircuitBreakerService.name);
    private readonly breakers = new Map<string, CircuitBreaker<unknown[], unknown>>();

    onModuleInit() {
        this.logger.log('CircuitBreakerService initialized');
    }

    getBreaker<T>(
        name: string,
        action: (...args: unknown[]) => Promise<T>,
        options: CircuitBreakerOptions = {},
    ): CircuitBreaker<unknown[], T> {
        if (this.breakers.has(name)) {
            return this.breakers.get(name) as CircuitBreaker<unknown[], T>;
        }

        const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
        const breaker = new CircuitBreaker(action, mergedOptions);

        breaker.on('open', () => {
            this.logger.warn(`Circuit breaker OPEN for: ${name}`);
        });

        breaker.on('halfOpen', () => {
            this.logger.log(`Circuit breaker HALF-OPEN for: ${name}`);
        });

        breaker.on('close', () => {
            this.logger.log(`Circuit breaker CLOSED for: ${name}`);
        });

        breaker.on('fallback', () => {
            this.logger.warn(`Circuit breaker FALLBACK triggered for: ${name}`);
        });

        breaker.on('timeout', () => {
            this.logger.warn(`Circuit breaker TIMEOUT for: ${name}`);
        });

        this.breakers.set(name, breaker as CircuitBreaker<unknown[], unknown>);
        return breaker;
    }

    async execute<T>(
        name: string,
        action: (...args: unknown[]) => Promise<T>,
        fallback?: () => T | Promise<T>,
        options?: CircuitBreakerOptions,
    ): Promise<T> {
        const breaker = this.getBreaker(name, action, options);

        if (fallback) {
            breaker.fallback(fallback);
        }

        return breaker.fire() as Promise<T>;
    }

    getStats(name: string): Record<string, unknown> | null {
        const breaker = this.breakers.get(name);
        if (!breaker) return null;

        let state: string;
        if (breaker.opened) {
            state = 'open';
        } else if (breaker.halfOpen) {
            state = 'half-open';
        } else {
            state = 'closed';
        }

        return {
            name,
            state,
            stats: breaker.stats,
        };
    }

    getAllStats(): Record<string, unknown>[] {
        const stats: Record<string, unknown>[] = [];
        for (const name of this.breakers.keys()) {
            const stat = this.getStats(name);
            if (stat) stats.push(stat);
        }
        return stats;
    }
}
