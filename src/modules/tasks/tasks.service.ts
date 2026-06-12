import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateTaskRequestDto, UpdateTaskRequestDto, TaskResponseDto, TaskListResponseDto, GetTasksQueryDto } from './dto';
import { ErrorCodes } from '../../common/constants';
import { Prisma } from '@prisma/client';

@Injectable()
export class TasksService {
    constructor(private readonly prisma: PrismaService) {}

    async create(userId: string, createDto: CreateTaskRequestDto): Promise<{ message: string }> {
        await this.prisma.task.create({
            data: {
                title: createDto.title,
                description: createDto.description,
                projectId: createDto.projectId,
                type: createDto.type,
                sprintId: createDto.sprintId,
                assigneeId: createDto.assigneeId,
                priority: createDto.priority,
                status: createDto.status,
                storyPoints: createDto.storyPoints,
                estimatedTime: createDto.estimatedTime,
                realTime: createDto.realTime,
                complexity: createDto.complexity,
                confidence: createDto.confidence,
                deadline: createDto.deadline ? new Date(createDto.deadline) : null,
                createdById: userId,
            },
        });

        return { message: 'Task created successfully' };
    }

    async findAll(projectId: number | undefined, sprintId: number | undefined, query: GetTasksQueryDto): Promise<TaskListResponseDto> {
        const page = query.page || 1;
        const limit = query.limit || 30;
        const skip = (page - 1) * limit;

        const whereCondition: Prisma.TaskWhereInput = {
            deletedAt: null,
        };

        if (query.status) whereCondition.status = query.status;
        if (query.priority) whereCondition.priority = query.priority;
        if (query.type) whereCondition.type = query.type;

        if (projectId !== undefined) {
            whereCondition.projectId = projectId;
        }

        if (sprintId !== undefined) {
            whereCondition.sprintId = sprintId;
        }

        const [tasks, total] = await Promise.all([
            this.prisma.task.findMany({
                where: whereCondition,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.task.count({ where: whereCondition }),
        ]);

        const totalPages = Math.ceil(total / limit);

        return new TaskListResponseDto({
            items: tasks.map((task) => new TaskResponseDto(task)),
            meta: {
                page,
                limit,
                total,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
            },
        });
    }

    async findOne(id: number): Promise<TaskResponseDto> {
        const task = await this.prisma.task.findUnique({
            where: { id, deletedAt: null },
        });

        if (!task) {
            throw new NotFoundException({
                code: ErrorCodes.RESOURCE_NOT_FOUND,
                message: 'Task not found.',
            });
        }

        return new TaskResponseDto(task);
    }

    async update(id: number, updateDto: UpdateTaskRequestDto): Promise<{ message: string }> {
        await this.findOne(id); // Ensure exists

        await this.prisma.task.update({
            where: { id },
            data: {
                title: updateDto.title,
                description: updateDto.description,
                type: updateDto.type,
                projectId: updateDto.projectId,
                sprintId: updateDto.sprintId,
                assigneeId: updateDto.assigneeId,
                priority: updateDto.priority,
                status: updateDto.status,
                storyPoints: updateDto.storyPoints,
                estimatedTime: updateDto.estimatedTime,
                realTime: updateDto.realTime,
                complexity: updateDto.complexity,
                confidence: updateDto.confidence,
                deadline: updateDto.deadline ? new Date(updateDto.deadline) : undefined,
            },
        });

        return { message: 'Task updated successfully' };
    }

    async softDelete(id: number): Promise<{ message: string }> {
        await this.findOne(id);

        await this.prisma.task.update({
            where: { id },
            data: { deletedAt: new Date() },
        });

        return { message: 'Task deleted successfully' };
    }
}
