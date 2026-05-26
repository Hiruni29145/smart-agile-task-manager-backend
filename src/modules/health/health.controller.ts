import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { HealthService, HealthStatus } from './health.service';
import { Public } from '../../common/decorators/public.decorator';

@Controller('health')
export class HealthController {
    constructor(private readonly healthService: HealthService) { }

    @Public()
    @Get()
    @HttpCode(HttpStatus.OK)
    async getHealth(): Promise<HealthStatus> {
        const health = await this.healthService.getHealth();
        return health;
    }

    @Public()
    @Get('live')
    @HttpCode(HttpStatus.OK)
    getLiveness(): { status: string } {
        return { status: 'ok' };
    }

    @Public()
    @Get('ready')
    async getReadiness(): Promise<{ status: string; ready: boolean }> {
        const health = await this.healthService.getHealth();
        const isReady = health.checks.database.status === 'ok';
        return {
            status: isReady ? 'ok' : 'error',
            ready: isReady,
        };
    }
}
