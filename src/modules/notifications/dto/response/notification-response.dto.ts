import { NotificationType } from '@prisma/client';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class NotificationResponseDto {
    @Expose()
    id!: number;

    @Expose()
    title!: string;

    @Expose()
    message!: string;

    @Expose()
    type!: NotificationType;

    @Expose()
    actionUrl!: string | null;

    @Expose()
    isRead!: boolean;

    @Expose()
    isFavorite!: boolean;

    @Expose()
    createdAt!: Date;

    constructor(partial: Partial<NotificationResponseDto>) {
        Object.assign(this, partial);
    }
}
