import { Controller, Get, UseGuards } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { TeamStatsResponseDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

@Controller('teams')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TeamsController {
    constructor(private readonly teamsService: TeamsService) {}

    @Get('stats')
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.DEVELOPER)
    async getTeamStats(): Promise<TeamStatsResponseDto> {
        return this.teamsService.getTeamStats();
    }
}
