import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardStatsResponseDto, DashboardAnalyticsResponseDto, TopCountryResponseDto, DashboardOverviewResponseDto } from './dto/response';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) { }

    @Get('analytics')
    async getAnalytics(): Promise<DashboardAnalyticsResponseDto> {
        return this.dashboardService.getAnalytics();
    }

    @Get('stats')
    async getDashboardStats(): Promise<DashboardStatsResponseDto> {
        return this.dashboardService.getDashboardStats();
    }

    @Get('overview')
    async getDashboardOverview(): Promise<DashboardOverviewResponseDto> {
        return this.dashboardService.getDashboardOverview();
    }
}
