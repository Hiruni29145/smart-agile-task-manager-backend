import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { TeamStatsResponseDto } from './dto';
import { UserRole, UserStatus } from '@prisma/client';

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
}
