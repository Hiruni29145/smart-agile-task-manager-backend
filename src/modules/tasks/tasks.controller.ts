import { Controller, Post, Get, Put, Delete, Body, Param, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskRequestDto, UpdateTaskRequestDto, TaskResponseDto, TaskListResponseDto, GetTasksQueryDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/interfaces/request-with-user.interface';

@Controller('tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TasksController {
    constructor(private readonly tasksService: TasksService) {}

    @Post()
    async create(
        @CurrentUser() user: AuthenticatedUser,
        @Body() createTaskDto: CreateTaskRequestDto,
    ): Promise<{ message: string }> {
        return this.tasksService.create(user.id, createTaskDto);
    }

    @Get()
    async findAll(
        @Query('projectId') projectId: string,
        @Query('sprintId') sprintId: string,
        @Query() query: GetTasksQueryDto,
    ): Promise<TaskListResponseDto> {
        const parsedProjectId = projectId ? parseInt(projectId, 10) : undefined;
        const parsedSprintId = sprintId ? parseInt(sprintId, 10) : undefined;
        return this.tasksService.findAll(parsedProjectId, parsedSprintId, query);
    }

    @Get(':id')
    async findOne(
        @Param('id', ParseIntPipe) id: number,
    ): Promise<TaskResponseDto> {
        return this.tasksService.findOne(id);
    }

    @Put(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateTaskDto: UpdateTaskRequestDto,
    ): Promise<{ message: string }> {
        return this.tasksService.update(id, updateTaskDto);
    }

    @Delete(':id')
    async remove(
        @Param('id', ParseIntPipe) id: number,
    ): Promise<{ message: string }> {
        return this.tasksService.softDelete(id);
    }
}
