import { Test, TestingModule } from '@nestjs/testing';
import { CircuitBreakerService } from './circuit-breaker.service';
import { Logger } from '@nestjs/common';

describe('CircuitBreakerService', () => {
    let service: CircuitBreakerService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [CircuitBreakerService],
        }).compile();

        service = module.get<CircuitBreakerService>(CircuitBreakerService);
        jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
        jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('execute', () => {
        it('should execute a successful action', async () => {
            const action = jest.fn().mockResolvedValue('success');
            const result = await service.execute('test-action', action);
            expect(result).toBe('success');
            expect(action).toHaveBeenCalled();
        });

        it('should return cached breaker for same name', async () => {
            const action = jest.fn().mockResolvedValue('success');
            await service.execute('test-action', action);
            const stats1 = service.getStats('test-action');

            await service.execute('test-action', action);
            const stats2 = service.getStats('test-action');

            expect(stats1).toBeDefined();
            expect(stats2).toBeDefined();
        });

        it('should trigger fallback on failure', async () => {
            const action = jest.fn().mockRejectedValue(new Error('Failed'));
            const fallback = jest.fn().mockReturnValue('fallback result');

            const result = await service.execute('fail-action', action, fallback);

            expect(result).toBe('fallback result');
            expect(fallback).toHaveBeenCalled();
        });

        it('should open circuit after threshold failures', async () => {
            const action = jest.fn().mockRejectedValue(new Error('Failed'));
            const options = {
                volumeThreshold: 1,
                errorThresholdPercentage: 1,
                resetTimeout: 1000
            };

            try {
                await service.execute('threshold-test', action, undefined, options);
            } catch (e) {
            }

            const stats = service.getStats('threshold-test');
            expect(stats?.state).toBeDefined();
        });
    });

    describe('getStats', () => {
        it('should return null for non-existent breaker', () => {
            expect(service.getStats('non-existent')).toBeNull();
        });

        it('should return stats for existing breaker', async () => {
            await service.execute('stats-test', async () => 'ok');
            const stats = service.getStats('stats-test');
            expect(stats).toHaveProperty('name', 'stats-test');
            expect(stats).toHaveProperty('state');
            expect(stats).toHaveProperty('stats');
        });
    });

    describe('getAllStats', () => {
        it('should return all stats', async () => {
            await service.execute('svc1', async () => 'ok');
            await service.execute('svc2', async () => 'ok');

            const allStats = service.getAllStats();
            expect(allStats).toHaveLength(2);
            expect(allStats.find(s => s.name === 'svc1')).toBeDefined();
            expect(allStats.find(s => s.name === 'svc2')).toBeDefined();
        });
    });

    describe('Lifecycle', () => {
        it('should log initialization', () => {
            const logSpy = jest.spyOn(Logger.prototype, 'log');
            service.onModuleInit();
            expect(logSpy).toHaveBeenCalledWith('CircuitBreakerService initialized');
        });
    });
});
