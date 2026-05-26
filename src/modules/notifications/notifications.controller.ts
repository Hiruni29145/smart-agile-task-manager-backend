import { Controller, Get, Put, Delete, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { User } from '@prisma/client';
import { PaginationDto, SuccessResponseDto } from '../../common/dto';
import { NotificationListResponseDto } from './dto';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @Get()
    async findAll(
        @CurrentUser() user: User,
        @Query() query: PaginationDto,
    ): Promise<NotificationListResponseDto> {
        return this.notificationsService.findAll(user.id, query);
    }

    @Get('favorites')
    async findFavorites(
        @CurrentUser() user: User,
        @Query() query: PaginationDto,
    ): Promise<NotificationListResponseDto> {
        return this.notificationsService.findFavorites(user.id, query);
    }

    @Put('read/all')
    async markAllAsRead(@CurrentUser() user: User): Promise<SuccessResponseDto> {
        return this.notificationsService.markAllAsRead(user.id);
    }

    @Put('read/:id')
    async markAsRead(
        @CurrentUser() user: User,
        @Param('id', ParseIntPipe) id: number,
    ): Promise<SuccessResponseDto> {
        return this.notificationsService.markAsRead(user.id, id);
    }

    @Put('favorite/:id')
    async addToFavorites(
        @CurrentUser() user: User,
        @Param('id', ParseIntPipe) id: number,
    ): Promise<SuccessResponseDto> {
        return this.notificationsService.addToFavorites(user.id, id);
    }

    @Put('unfavorite/:id')
    async removeFromFavorites(
        @CurrentUser() user: User,
        @Param('id', ParseIntPipe) id: number,
    ): Promise<SuccessResponseDto> {
        return this.notificationsService.removeFromFavorites(user.id, id);
    }

    @Delete('all')
    async softDeleteAll(@CurrentUser() user: User): Promise<SuccessResponseDto> {
        return this.notificationsService.softDeleteAll(user.id);
    }

    @Delete(':id')
    async softDelete(
        @CurrentUser() user: User,
        @Param('id', ParseIntPipe) id: number,
    ): Promise<SuccessResponseDto> {
        return this.notificationsService.softDelete(user.id, id);
    }
}
