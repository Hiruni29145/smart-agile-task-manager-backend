import { Injectable, UnauthorizedException, BadRequestException, Logger, } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import { SuccessResponseDto } from '../../common/dto';
import { hashRefreshToken } from '../../common/utils';
import { DeviceInfo } from '../../common/utils/device-info.util';
import { ErrorCodes, Messages } from '../../common/constants';

export interface CreateSessionData {
    userId: string;
    refreshToken: string;
    deviceInfo: DeviceInfo;
    expiresAt: Date;
}

export interface SessionDto {
    id: string;
    deviceName: string;
    deviceType: string;
    browser: string;
    os: string;
    ipAddress: string;
    lastActivityAt: Date;
    createdAt: Date;
    isActive: boolean;
    isCurrent: boolean;
}

@Injectable()
export class SessionService {
    private readonly logger = new Logger(SessionService.name);
    private readonly maxSessionsPerUser: number;

    constructor(
        private readonly prisma: PrismaService,
        private readonly configService: ConfigService,
    ) {
        this.maxSessionsPerUser = this.configService.get<number>(
            'MAX_SESSIONS_PER_USER',
            5,
        );
    }

    async createSession(data: CreateSessionData): Promise<void> {
        const { userId, refreshToken, deviceInfo, expiresAt } = data;

        const refreshTokenHash = hashRefreshToken(refreshToken);

        await this.prisma.$transaction(async (tx) => {
            const activeSessionsCount = await tx.userSession.count({
                where: {
                    userId,
                    isActive: true,
                    expiresAt: { gt: new Date() },
                },
            });

            if (activeSessionsCount >= this.maxSessionsPerUser) {
                const oldestSession = await tx.userSession.findFirst({
                    where: {
                        userId,
                        isActive: true,
                    },
                    orderBy: { lastActivityAt: 'asc' },
                });

                if (oldestSession) {
                    await tx.userSession.update({
                        where: { id: oldestSession.id },
                        data: { isActive: false },
                    });
                    this.logger.warn(
                        `Revoked oldest session for user ${userId} due to max sessions limit`,
                    );
                }
            }

            await tx.userSession.create({
                data: {
                    userId,
                    refreshTokenHash,
                    deviceName: deviceInfo.deviceName,
                    deviceType: deviceInfo.deviceType,
                    browser: deviceInfo.browser,
                    os: deviceInfo.os,
                    ipAddress: deviceInfo.ipAddress,
                    userAgent: deviceInfo.userAgent,
                    expiresAt,
                    isActive: true,
                },
            });
        });

        this.logger.log(`Session created for user ${userId} on ${deviceInfo.deviceType}`);
    }

    async validateSession(
        userId: string,
        refreshToken: string,
    ): Promise<{ sessionId: string; userId: string }> {
        const refreshTokenHash = hashRefreshToken(refreshToken);

        const session = await this.prisma.userSession.findFirst({
            where: {
                userId,
                refreshTokenHash,
                isActive: true,
                expiresAt: { gt: new Date() },
            },
            select: {
                id: true,
                userId: true,
            },
        });

        if (!session) {
            throw new UnauthorizedException({
                code: ErrorCodes.AUTH_SESSION_INVALID,
                message: Messages.AUTH_SESSION_INVALID,
            });
        }

        await this.prisma.userSession.update({
            where: { id: session.id },
            data: { lastActivityAt: new Date() },
        });

        return {
            sessionId: session.id,
            userId: session.userId,
        };
    }

    async revokeSession(userId: string, sessionId: string): Promise<SuccessResponseDto> {
        const session = await this.prisma.userSession.findFirst({
            where: { id: sessionId, userId },
        });

        if (!session) {
            throw new BadRequestException({
                code: ErrorCodes.AUTH_SESSION_INVALID,
                message: Messages.AUTH_SESSION_INVALID,
            });
        }

        await this.prisma.userSession.update({
            where: { id: sessionId },
            data: { isActive: false },
        });

        this.logger.log(`Session ${sessionId} revoked for user ${userId}`);
        return new SuccessResponseDto({ message: Messages.AUTH_SESSION_REVOKED });
    }

    /**
     * Check if user has any active session (used by JWT strategy)
     */
    async hasActiveSession(userId: string): Promise<boolean> {
        const count = await this.prisma.userSession.count({
            where: {
                userId,
                isActive: true,
                expiresAt: { gt: new Date() },
            },
        });
        return count > 0;
    }

    async revokeAllSessions(userId: string): Promise<SuccessResponseDto> {
        await this.prisma.userSession.updateMany({
            where: { userId },
            data: { isActive: false },
        });

        this.logger.log(`All sessions revoked for user ${userId}`);
        return new SuccessResponseDto({ message: Messages.AUTH_ALL_SESSIONS_REVOKED });
    }

    async revokeOtherSessions(
        userId: string,
        currentSessionId: string,
    ): Promise<void> {
        await this.prisma.userSession.updateMany({
            where: {
                userId,
                id: { not: currentSessionId },
            },
            data: { isActive: false },
        });

        this.logger.log(
            `All other sessions revoked for user ${userId} except ${currentSessionId}`,
        );
    }

    async getActiveSessions(
        userId: string,
        currentSessionId?: string,
    ): Promise<SessionDto[]> {
        const sessions = await this.prisma.userSession.findMany({
            where: {
                userId,
                isActive: true,
                expiresAt: { gt: new Date() },
            },
            orderBy: { lastActivityAt: 'desc' },
            select: {
                id: true,
                deviceName: true,
                deviceType: true,
                browser: true,
                os: true,
                ipAddress: true,
                lastActivityAt: true,
                createdAt: true,
                isActive: true,
            },
        });

        return sessions.map((session) => ({
            id: session.id,
            deviceName: session.deviceName || 'Unknown Device',
            deviceType: session.deviceType,
            browser: session.browser || 'Unknown',
            os: session.os || 'Unknown',
            ipAddress: session.ipAddress,
            lastActivityAt: session.lastActivityAt,
            createdAt: session.createdAt,
            isActive: session.isActive,
            isCurrent: session.id === currentSessionId,
        }));
    }

    @Cron(CronExpression.EVERY_DAY_AT_2AM)
    async cleanupExpiredSessions(): Promise<number> {
        const result = await this.prisma.userSession.updateMany({
            where: {
                OR: [
                    { expiresAt: { lt: new Date() } },
                    {
                        isActive: true,
                        lastActivityAt: {
                            lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days
                        },
                    },
                ],
            },
            data: { isActive: false },
        });

        if (result.count > 0) {
            this.logger.log(`Cleaned up ${result.count} expired sessions`);
        }

        return result.count;
    }

    @Cron(CronExpression.EVERY_WEEK)
    async deleteOldSessions(): Promise<number> {
        const result = await this.prisma.userSession.deleteMany({
            where: {
                isActive: false,
                updatedAt: {
                    lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days
                },
            },
        });

        if (result.count > 0) {
            this.logger.log(`Deleted ${result.count} old inactive sessions`);
        }

        return result.count;
    }
}
