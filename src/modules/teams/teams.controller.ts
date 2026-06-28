import { Controller, Get, UseGuards } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { TeamStatsResponseDto, TeamMemberListResponseDto, TeamMemberDetailsResponseDto } from './dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Query, Param } from '@nestjs/common';
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

    @Get('members')
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.DEVELOPER)
    async getTeamMembers(
        @Query() query: PaginationDto,
    ): Promise<TeamMemberListResponseDto> {
        return this.teamsService.getTeamMembers(query);
    }

    @Get('members/:id')
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.DEVELOPER)
    async getTeamMemberDetails(
        @Param('id') id: string,
    ): Promise<TeamMemberDetailsResponseDto> {
        return this.teamsService.getTeamMemberDetails(id);
    }
}
