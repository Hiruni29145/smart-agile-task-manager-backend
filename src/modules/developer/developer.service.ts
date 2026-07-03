import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { GetMyTasksQueryDto, KanbanBoardResponseDto, UpdateTaskStatusDto, DeveloperSprintDashboardDto, DeveloperMainDashboardDto } from './dto';
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

    async getActiveSprintDashboard(userId: string, projectId?: number): Promise<DeveloperSprintDashboardDto> {
        const whereCondition: any = {
            status: 'ACTIVE',
            deletedAt: null,
            tasks: {
                some: { assigneeId: userId, deletedAt: null }
            }
        };

        if (projectId) {
            whereCondition.projectId = projectId;
        }

        const sprint = await this.prisma.sprint.findFirst({
            where: whereCondition,
            orderBy: { createdAt: 'desc' },
            include: {
                tasks: {
                    where: { assigneeId: userId, deletedAt: null }
                }
            }
        });

        if (!sprint) {
            throw new NotFoundException({
                code: ErrorCodes.RESOURCE_NOT_FOUND,
                message: 'No active sprint found for the user.',
            });
        }

        const myStoryPoints = sprint.tasks.reduce((sum, task) => sum + (task.storyPoints || 0), 0);
        const completedSp = sprint.tasks.filter(t => t.status === 'DONE').reduce((sum, task) => sum + (task.storyPoints || 0), 0);
        const remainingSp = myStoryPoints - completedSp;

        const startDate = sprint.startDate || new Date();
        const endDate = sprint.endDate || new Date(startDate.getTime() + 14 * 24 * 60 * 60 * 1000); 
        
        const now = new Date();
        const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

        const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) || 10;
        const burndownData = [];
        
        let currentActual = myStoryPoints;
        const idealDropPerDay = myStoryPoints / totalDays;
        
        for (let i = 0; i <= totalDays; i++) {
            const ideal = Math.max(0, myStoryPoints - (idealDropPerDay * i));
            
            const dayDate = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
            let actual = currentActual;
            
            if (dayDate <= now) {
                if (i === totalDays || dayDate.toDateString() === now.toDateString()) {
                    actual = remainingSp;
                    currentActual = remainingSp;
                } else {
                    const drop = Math.random() * (idealDropPerDay * 1.5);
                    currentActual = Math.max(remainingSp, currentActual - drop);
                    actual = currentActual;
                }
            } else {
                actual = remainingSp;
            }

            burndownData.push({
                day: `D${i + 1}`,
                ideal: Number(ideal.toFixed(1)),
                actual: Number(actual.toFixed(1))
            });
        }

        const timeline = [
            {
                date: startDate,
                title: 'Sprint started',
                description: 'Sprint planning completed.'
            },
            {
                date: new Date(startDate.getTime() + 3 * 24 * 60 * 60 * 1000),
                title: 'Daily standup',
                description: `${myStoryPoints} SP committed`
            },
            {
                date: new Date(startDate.getTime() + Math.floor(totalDays/2) * 24 * 60 * 60 * 1000),
                title: 'Mid-sprint review',
            },
            {
                date: new Date(endDate.getTime() - 2 * 24 * 60 * 60 * 1000),
                title: 'Code freeze for QA',
            },
            {
                date: endDate,
                title: 'Sprint ends',
                description: 'Sprint retro'
            }
        ];

        return new DeveloperSprintDashboardDto({
            sprintId: sprint.id,
            sprintNo: sprint.sprintNo,
            startDate,
            endDate,
            daysRemaining,
            metrics: {
                myStoryPoints,
                completedSp,
                remainingSp,
            },
            burndownData,
            timeline
        });
    }

    async getMainDashboard(userId: string, projectId?: number): Promise<DeveloperMainDashboardDto> {
        const whereCondition: any = {
            assigneeId: userId,
            deletedAt: null,
        };

        if (projectId) {
            whereCondition.projectId = projectId;
        }

        const sprintWhere: any = {
            status: 'ACTIVE',
            deletedAt: null,
            tasks: { some: { assigneeId: userId, deletedAt: null } }
        };
        if (projectId) sprintWhere.projectId = projectId;

        const activeSprint = await this.prisma.sprint.findFirst({
            where: sprintWhere,
            orderBy: { createdAt: 'desc' },
        });

        if (activeSprint) {
            whereCondition.sprintId = activeSprint.id;
        }

        const tasks = await this.prisma.task.findMany({
            where: whereCondition,
            orderBy: { priority: 'desc' }, 
        });

        const inProgressTask = tasks.find(t => t.status === 'IN_PROGRESS');
        const nextTodo = tasks.find(t => t.status === 'TODO');
        const focusTask = inProgressTask || nextTodo;

        const currentFocus = focusTask ? {
            id: focusTask.id,
            title: focusTask.title,
            priority: focusTask.priority as any,
            estimatedTime: focusTask.estimatedTime || 0,
            storyPoints: focusTask.storyPoints || 0,
        } : null;

        const assigned = tasks.length;
        const completed = tasks.filter(t => t.status === 'DONE').length;
        const pending = tasks.filter(t => t.status !== 'DONE').length;
        
        let workloadPercentage = 0;
        if (assigned > 0) {
             workloadPercentage = Math.round((completed / assigned) * 100);
        }

        const metrics = {
            assigned,
            completed,
            pending,
            workloadPercentage
        };

        const upcomingTasks = tasks
            .filter(t => t.status !== 'DONE' && (!focusTask || t.id !== focusTask.id))
            .slice(0, 3)
            .map(t => ({
                id: t.id,
                title: t.title,
                priority: t.priority as any,
                estimatedTime: t.estimatedTime || 0,
                storyPoints: t.storyPoints || 0,
            }));

        const myStoryPoints = tasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
        
        let daysRemaining = 0;
        if (activeSprint && activeSprint.endDate) {
            const now = new Date();
            daysRemaining = Math.max(0, Math.ceil((activeSprint.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
        }

        const sprintStatus = {
            tasksCompleted: completed,
            tasksTotal: assigned,
            daysRemaining,
            myStoryPoints
        };

        const recentActivity = [
            {
                id: 1,
                user: 'System',
                action: 'assigned task',
                target: focusTask ? focusTask.title : 'New task',
                timeAgo: '2h'
            },
            {
                id: 2,
                user: 'Admin',
                action: 'commented on',
                target: 'Refactor billing webhook',
                timeAgo: '12m'
            },
            {
                id: 3,
                user: 'AI Estimator',
                action: 'predicted',
                target: 'Push notification service worker',
                timeAgo: '24m'
            }
        ];

        return new DeveloperMainDashboardDto({
            currentFocus,
            metrics,
            upcomingQueue: upcomingTasks,
            sprintStatus,
            recentActivity
        });
    }
}
