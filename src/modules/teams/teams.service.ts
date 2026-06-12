import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { TeamStatsResponseDto, TeamMemberProfileDto, TeamMemberListResponseDto } from './dto';
import { UserRole, UserStatus, TaskStatus } from '@prisma/client';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class TeamsService {
    constructor(private readonly prisma: PrismaService) {}

    async getTeamStats(): Promise<TeamStatsResponseDto> {
        const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000);

        const [totalDeveloper, activeNow] = await Promise.all([
            // Total Developers
            this.prisma.user.count({
                where: {
                    role: UserRole.DEVELOPER,
                    status: UserStatus.ACTIVE,
                    deletedAt: null,
                },
            }),
            // Developers active in the last 30 minutes
            this.prisma.user.count({
                where: {
                    role: UserRole.DEVELOPER,
                    status: UserStatus.ACTIVE,
                    deletedAt: null,
                    sessions: {
                        some: {
                            lastActivityAt: {
                                gte: thirtyMinsAgo,
                            },
                            isActive: true,
                        },
                    },
                },
            }),
        ]);

        return new TeamStatsResponseDto({
            totalDeveloper,
            activeNow,
        });
    }

    async getTeamMembers(query: PaginationDto): Promise<TeamMemberListResponseDto> {
        const { page = 1, limit = 10 } = query;
        const skip = (page - 1) * limit;
        const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000);

        const where = {
            role: UserRole.DEVELOPER,
            status: UserStatus.ACTIVE,
            deletedAt: null,
        };

        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                skip,
                take: limit,
                include: {
                    sessions: {
                        where: {
                            isActive: true,
                            lastActivityAt: { gte: thirtyMinsAgo },
                        },
                        take: 1,
                    },
                    assignedTasks: {
                        where: {
                            status: { in: [TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.REVIEW] },
                            deletedAt: null,
                        },
                    },
                },
                orderBy: { firstName: 'asc' },
            }),
            this.prisma.user.count({ where }),
        ]);

        const STANDARD_WEEKLY_HOURS = 40;
        const FALLBACK_TASK_HOURS = 5;

        const items = users.map((user) => {
            const isOnline = user.sessions.length > 0;
            const openTasks = user.assignedTasks.length;

            const totalEstimatedHours = user.assignedTasks.reduce((sum, task) => {
                return sum + (task.estimatedTime || FALLBACK_TASK_HOURS);
            }, 0);

            let workloadPercentage = Math.round((totalEstimatedHours / STANDARD_WEEKLY_HOURS) * 100);
            if (workloadPercentage > 100) workloadPercentage = 100;

            const capacityStatus = workloadPercentage >= 80 ? 'Overloaded' : 'Healthy';

            return new TeamMemberProfileDto({
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                avatar: user.avatar,
                jobDescription: user.jobDescription,
                isOnline,
                openTasks,
                workloadPercentage,
                capacityStatus,
            });
        });

        return new TeamMemberListResponseDto({
            items,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasNextPage: page < Math.ceil(total / limit),
                hasPreviousPage: page > 1,
            },
        });
    }
}
