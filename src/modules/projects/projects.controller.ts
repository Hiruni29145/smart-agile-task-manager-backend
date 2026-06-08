import { Controller, Post, Get, Put, Delete, Body, Query, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectRequestDto, UpdateProjectRequestDto, ProjectResponseDto, ProjectListResponseDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/interfaces/request-with-user.interface';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

@Controller('projects')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProjectsController {
    constructor(private readonly projectsService: ProjectsService) {}

    @Post()
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    async create(
        @CurrentUser() user: AuthenticatedUser,
        @Body() createProjectDto: CreateProjectRequestDto,
    ): Promise<ProjectResponseDto> {
        return this.projectsService.create(user.id, createProjectDto);
    }

    @Get()
     @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN,UserRole.DEVELOPER)
    async findAll(
        @CurrentUser() user: AuthenticatedUser,
        @Query() query: PaginationDto,
    ): Promise<ProjectListResponseDto> {
        return this.projectsService.findAll(user.id, query);
    }

    @Get(':id')
    async findOne(
        @Param('id', ParseIntPipe) id: number,
    ): Promise<ProjectResponseDto> {
        return this.projectsService.findOne(id);
    }

    @Put(':id')
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    async update(
        @CurrentUser() user: AuthenticatedUser,
        @Param('id', ParseIntPipe) id: number,
        @Body() updateProjectDto: UpdateProjectRequestDto,
    ): Promise<ProjectResponseDto> {
        return this.projectsService.update(user.id, id, updateProjectDto);
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    async remove(
        @CurrentUser() user: AuthenticatedUser,
        @Param('id', ParseIntPipe) id: number,
    ): Promise<{ message: string }> {
        return this.projectsService.softDelete(user.id, id);
    }
}
