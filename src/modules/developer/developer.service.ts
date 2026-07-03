import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { GetMyTasksQueryDto, KanbanBoardResponseDto, UpdateTaskStatusDto } from './dto';
import { TaskListResponseDto, TaskResponseDto } from '../tasks/dto';
import { ErrorCodes } from '../../common/constants';

@Injectable()
export class DeveloperService {
    constructor(private readonly prisma: PrismaService) {}

    async getMyTasks(userId: string, query: GetMyTasksQueryDto): Promise<TaskListResponseDto> {
        const page = query.page || 1;
        const limit = query.limit || 30;
        const skip = (page - 1) * limit;

        const whereCondition: any = {
            deletedAt: null,
            assigneeId: userId,
        };

        if (query.status) {
            whereCondition.status = query.status;
        }

        if (query.search) {
            whereCondition.OR = [
                { title: { contains: query.search, mode: 'insensitive' } },
                { description: { contains: query.search, mode: 'insensitive' } },
            ];
        }

        const [tasks, total] = await Promise.all([
            this.prisma.task.findMany({
                where: whereCondition,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    assignee: true,
                },
            }),
            this.prisma.task.count({ where: whereCondition }),
        ]);

        const totalPages = Math.ceil(total / limit);

        return new TaskListResponseDto({
            items: tasks.map((task) => {
                const assignee = task.assignee
                    ? {
                        id: task.assignee.id,
                        name: `${task.assignee.firstName} ${task.assignee.lastName}`.trim(),
                    }
                    : null;

                return new TaskResponseDto({
                    ...task,
                    assignee,
                });
            }),
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

    async getKanbanBoard(userId: string): Promise<KanbanBoardResponseDto> {
        const tasks = await this.prisma.task.findMany({
            where: {
                assigneeId: userId,
                deletedAt: null,
            },
            include: { assignee: true },
            orderBy: { createdAt: 'desc' },
        });

        const mapTask = (task: any) => {
            const assignee = task.assignee
                ? {
                    id: task.assignee.id,
                    name: `${task.assignee.firstName} ${task.assignee.lastName}`.trim(),
                }
                : null;
            return new TaskResponseDto({ ...task, assignee });
        };

        const kanban = {
            TODO: tasks.filter(t => t.status === 'TODO').map(mapTask),
            IN_PROGRESS: tasks.filter(t => t.status === 'IN_PROGRESS').map(mapTask),
            REVIEW: tasks.filter(t => t.status === 'REVIEW').map(mapTask),
            DONE: tasks.filter(t => t.status === 'DONE').map(mapTask),
        };

        return new KanbanBoardResponseDto(kanban);
    }

    async updateTaskStatus(userId: string, taskId: number, updateDto: UpdateTaskStatusDto): Promise<{ message: string }> {
        const task = await this.prisma.task.findUnique({
            where: { id: taskId, deletedAt: null },
        });

        if (!task || task.assigneeId !== userId) {
            throw new NotFoundException({
                code: ErrorCodes.RESOURCE_NOT_FOUND,
                message: 'Task not found or you are not authorized to update it.',
            });
        }

        await this.prisma.task.update({
            where: { id: taskId },
            data: { status: updateDto.status },
        });

        return { message: 'Task status updated successfully' };
    }
}
