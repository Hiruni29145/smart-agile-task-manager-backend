import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { GetMyTasksQueryDto } from './dto';
import { TaskListResponseDto, TaskResponseDto } from '../tasks/dto';

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
}
