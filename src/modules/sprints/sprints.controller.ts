import { Controller, Post, Get, Put, Delete, Body, Param, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { SprintsService } from './sprints.service';
import { CreateSprintRequestDto, UpdateSprintRequestDto, SprintResponseDto, SprintListResponseDto } from './dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

@Controller('sprints')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SprintsController {
    constructor(private readonly sprintsService: SprintsService) {}

    @Post()
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.DEVELOPER)
    async create(
        @Body() createSprintDto: CreateSprintRequestDto,
    ): Promise<{ message: string }> {
        return this.sprintsService.create(createSprintDto);
    }

    @Get()
    async findAll(
        @Query('projectId') projectId: string,
        @Query() query: PaginationDto,
    ): Promise<SprintListResponseDto> {
        const parsedProjectId = projectId ? parseInt(projectId, 10) : undefined;
        return this.sprintsService.findAll(parsedProjectId, query);
    }

    @Get(':id')
    async findOne(
        @Param('id', ParseIntPipe) id: number,
    ): Promise<SprintResponseDto> {
        return this.sprintsService.findOne(id);
    }

    @Put(':id')
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.DEVELOPER)
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateSprintDto: UpdateSprintRequestDto,
    ): Promise<{ message: string }> {
        return this.sprintsService.update(id, updateSprintDto);
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    async remove(
        @Param('id', ParseIntPipe) id: number,
    ): Promise<{ message: string }> {
        return this.sprintsService.softDelete(id);
    }
}
