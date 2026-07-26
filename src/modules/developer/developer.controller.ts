import { Controller, Get, Query, UseGuards, Patch, Param, Body, ParseIntPipe, Post, Put } from '@nestjs/common';
import { DeveloperService } from './developer.service';
import { GetMyTasksQueryDto, KanbanBoardResponseDto, UpdateTaskStatusDto, DeveloperSprintDashboardDto, DeveloperMainDashboardDto, DeveloperProjectListResponseDto } from './dto';
import { TaskListResponseDto } from '../tasks/dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { User } from '@prisma/client';

@Controller('developer')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DeveloperController {
    constructor(private readonly developerService: DeveloperService) {}

    @Get('tasks')
    @Roles(UserRole.DEVELOPER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
    async getMyTasks(
        @Query() query: GetMyTasksQueryDto,
        @CurrentUser() user: User,
    ): Promise<TaskListResponseDto> {
        return this.developerService.getMyTasks(user.id, query);
    }

    @Get('kanban')
    @Roles(UserRole.DEVELOPER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
    async getKanbanBoard(
        @CurrentUser() user: User,
    ): Promise<KanbanBoardResponseDto> {
        return this.developerService.getKanbanBoard(user.id);
    }

    @Put('tasks/:id/status')
    @Roles(UserRole.DEVELOPER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
    async updateTaskStatus(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateDto: UpdateTaskStatusDto,
        @CurrentUser() user: User,
    ): Promise<{ message: string }> {
        return this.developerService.updateTaskStatus(user.id, id, updateDto);
    }

    @Get('sprint/active')
    @Roles(UserRole.DEVELOPER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
    async getActiveSprintDashboard(
        @CurrentUser() user: User,
        @Query('projectId') projectId?: string,
    ): Promise<DeveloperSprintDashboardDto> {
        const parsedProjectId = projectId ? parseInt(projectId, 10) : undefined;
        return this.developerService.getActiveSprintDashboard(user.id, parsedProjectId);
    }

    @Get('dashboard')
    @Roles(UserRole.DEVELOPER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
    async getMainDashboard(
        @CurrentUser() user: User,
        @Query('projectId') projectId?: string,
    ): Promise<DeveloperMainDashboardDto> {
        const parsedProjectId = projectId ? parseInt(projectId, 10) : undefined;
        return this.developerService.getMainDashboard(user.id, parsedProjectId);
    }

    @Get('projects/active')
    @Roles(UserRole.DEVELOPER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
    async getActiveProjects(
        @CurrentUser() user: User,
    ): Promise<DeveloperProjectListResponseDto> {
        return this.developerService.getActiveProjects(user.id);
    }
}
