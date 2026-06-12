import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { DashboardStatsResponseDto, ActiveSprintsProgressResponseDto, GlobalDistributionResponseDto } from './dto';
import { ProjectStatus, SprintStatus, TaskStatus, UserStatus, TaskType } from '@prisma/client';

@Injectable()
export class DashboardService {
    constructor(private readonly prisma: PrismaService) {}

    async getStats(): Promise<DashboardStatsResponseDto> {
        const [activeProjects, activeSprints, openTasks, totalMembers] = await Promise.all([
            this.prisma.project.count({
                where: { status: ProjectStatus.ACTIVE, deletedAt: null },
            }),
            this.prisma.sprint.count({
                where: { status: SprintStatus.ACTIVE, deletedAt: null },
            }),
            this.prisma.task.count({
                where: { status: TaskStatus.IN_PROGRESS, deletedAt: null },
            }),
            this.prisma.user.count({
                where: { status: UserStatus.ACTIVE, deletedAt: null },
            }),
        ]);

        return new DashboardStatsResponseDto({
            activeProjects,
            activeSprints,
            openTasks,
            totalMembers,
        });
    }

    async getActiveSprintsProgress(): Promise<{ items: ActiveSprintsProgressResponseDto[] }> {
        const activeSprints = await this.prisma.sprint.findMany({
            where: {
                status: SprintStatus.ACTIVE,
                deletedAt: null,
            },
            include: {
                project: {
                    select: { name: true },
                },
                tasks: {
                    where: { deletedAt: null },
                    select: { status: true },
                },
            },
        });

        const today = new Date();

        const items = activeSprints.map((sprint) => {
            const totalTasks = sprint.tasks.length;
            const completedTasks = sprint.tasks.filter((t) => t.status === TaskStatus.DONE).length;
            const progressPercentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

            let daysLeft: number | null = null;
            if (sprint.endDate) {
                const diffTime = sprint.endDate.getTime() - today.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                daysLeft = diffDays > 0 ? diffDays : 0;
            }

            return new ActiveSprintsProgressResponseDto({
                projectId: sprint.projectId,
                projectName: sprint.project.name,
                sprintId: sprint.id,
                sprintName: sprint.name,
                completedTasks,
                totalTasks,
                progressPercentage,
                daysLeft,
            });
        });

        return { items };
    }

    async getGlobalDistribution(): Promise<GlobalDistributionResponseDto> {
        // Find tasks in active projects
        const groupedTasks = await this.prisma.task.groupBy({
            by: ['type'],
            where: {
                deletedAt: null,
                project: {
                    status: ProjectStatus.ACTIVE,
                    deletedAt: null,
                },
            },
            _count: {
                id: true,
            },
        });

        const distribution = {
            feature: 0,
            bug: 0,
            chore: 0,
            spike: 0,
        };

        for (const group of groupedTasks) {
            if (group.type === TaskType.FEATURE) distribution.feature = group._count.id;
            if (group.type === TaskType.BUG) distribution.bug = group._count.id;
            if (group.type === TaskType.CHORE) distribution.chore = group._count.id;
            if (group.type === TaskType.SPIKE) distribution.spike = group._count.id;
        }

        return new GlobalDistributionResponseDto(distribution);
    }
}
