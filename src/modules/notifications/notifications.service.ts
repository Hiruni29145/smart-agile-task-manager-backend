import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { PaginationDto, SuccessResponseDto } from '../../common/dto';
import { NotificationListResponseDto, NotificationResponseDto } from './dto';
import { NotificationType } from '@prisma/client';
import { Messages } from '../../common/constants';

@Injectable()
export class NotificationsService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll(userId: string, query: PaginationDto): Promise<NotificationListResponseDto> {
        const { page = 1, limit = 30 } = query;
        const skip = (page - 1) * limit;

        const where = {
            userId,
            deletedAt: null,
        };

        const [items, total, totalUnread, totalRead] = await Promise.all([
            this.prisma.notification.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.notification.count({ where }),
            this.prisma.notification.count({ where: { ...where, isRead: false } }),
            this.prisma.notification.count({ where: { ...where, isRead: true } }),
        ]);

        const mappedItems = items.map((item) => new NotificationResponseDto(item));

        return new NotificationListResponseDto({
            items: mappedItems,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasNextPage: page < Math.ceil(total / limit),
                hasPreviousPage: page > 1,
            },
            stats: {
                totalUnread,
                totalRead,
            },
        });
    }

    async findFavorites(userId: string, query: PaginationDto): Promise<NotificationListResponseDto> {
        const { page = 1, limit = 30 } = query;
        const skip = (page - 1) * limit;

        const where = {
            userId,
            isFavorite: true,
            deletedAt: null,
        };

        const [items, total] = await Promise.all([
            this.prisma.notification.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.notification.count({ where }),
        ]);

        const [totalUnread, totalRead] = await Promise.all([
            this.prisma.notification.count({ where: { userId, deletedAt: null, isRead: false } }),
            this.prisma.notification.count({ where: { userId, deletedAt: null, isRead: true } }),
        ]);

        const mappedItems = items.map((item) => new NotificationResponseDto(item));

        return new NotificationListResponseDto({
            items: mappedItems,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasNextPage: page < Math.ceil(total / limit),
                hasPreviousPage: page > 1,
            },
            stats: {
                totalUnread,
                totalRead,
            },
        });
    }

    async markAsRead(userId: string, id: number): Promise<SuccessResponseDto> {
        const notification = await this.prisma.notification.findFirst({
            where: { id, userId, deletedAt: null },
        });

        if (!notification) {
            throw new NotFoundException(Messages.NOTIFICATION_NOT_FOUND);
        }

        await this.prisma.notification.update({
            where: { id },
            data: { isRead: true },
        });

        return new SuccessResponseDto({ message: Messages.NOTIFICATION_MARKED_READ });
    }

    async markAllAsRead(userId: string): Promise<SuccessResponseDto> {
        await this.prisma.notification.updateMany({
            where: { userId, deletedAt: null, isRead: false },
            data: { isRead: true },
        });

        return new SuccessResponseDto({ message: Messages.NOTIFICATION_ALL_MARKED_READ });
    }

    async toggleFavorite(userId: string, id: number): Promise<boolean> {
        const notification = await this.prisma.notification.findFirst({
            where: { id, userId, deletedAt: null },
        });

        if (!notification) {
            throw new NotFoundException(Messages.NOTIFICATION_NOT_FOUND);
        }

        const updated = await this.prisma.notification.update({
            where: { id },
            data: { isFavorite: !notification.isFavorite },
        });

        return updated.isFavorite;
    }

    async addToFavorites(userId: string, id: number): Promise<SuccessResponseDto> {
        const notification = await this.prisma.notification.findFirst({
            where: { id, userId, deletedAt: null },
        });

        if (!notification) {
            throw new NotFoundException(Messages.NOTIFICATION_NOT_FOUND);
        }

        await this.prisma.notification.update({
            where: { id },
            data: { isFavorite: true },
        });

        return new SuccessResponseDto({ message: Messages.NOTIFICATION_ADDED_FAVORITE });
    }

    async removeFromFavorites(userId: string, id: number): Promise<SuccessResponseDto> {
        const notification = await this.prisma.notification.findFirst({
            where: { id, userId, deletedAt: null },
        });

        if (!notification) {
            throw new NotFoundException(Messages.NOTIFICATION_NOT_FOUND);
        }

        await this.prisma.notification.update({
            where: { id },
            data: { isFavorite: false },
        });

        return new SuccessResponseDto({ message: Messages.NOTIFICATION_REMOVED_FAVORITE });
    }

    async softDelete(userId: string, id: number): Promise<SuccessResponseDto> {
        const notification = await this.prisma.notification.findFirst({
            where: { id, userId, deletedAt: null },
        });

        if (!notification) {
            throw new NotFoundException(Messages.NOTIFICATION_NOT_FOUND);
        }

        await this.prisma.notification.update({
            where: { id },
            data: { deletedAt: new Date() },
        });

        return new SuccessResponseDto({ message: Messages.NOTIFICATION_DELETED });
    }

    async softDeleteAll(userId: string): Promise<SuccessResponseDto> {
        await this.prisma.notification.updateMany({
            where: { userId, deletedAt: null },
            data: { deletedAt: new Date() },
        });

        return new SuccessResponseDto({ message: Messages.NOTIFICATION_ALL_DELETED });
    }

    async create(
        userId: string,
        title: string,
        message: string,
        type: NotificationType = NotificationType.INFO,
        actionUrl?: string,
    ) {
        return this.prisma.notification.create({
            data: {
                userId,
                title,
                message,
                type,
                actionUrl,
            },
        });
    }
}
