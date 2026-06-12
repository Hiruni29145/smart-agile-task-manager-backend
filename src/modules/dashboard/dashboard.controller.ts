import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardStatsResponseDto, ActiveSprintsProgressResponseDto, GlobalDistributionResponseDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) {}

    @Get('stats')
    async getStats(): Promise<DashboardStatsResponseDto> {
        return this.dashboardService.getStats();
    }

    @Get('active-sprints')
    async getActiveSprintsProgress(): Promise<{ items: ActiveSprintsProgressResponseDto[] }> {
        return this.dashboardService.getActiveSprintsProgress();
    }

    @Get('global-distribution')
    async getGlobalDistribution(): Promise<GlobalDistributionResponseDto> {
        return this.dashboardService.getGlobalDistribution();
    }
}
