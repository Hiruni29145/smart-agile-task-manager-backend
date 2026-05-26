import { Exclude, Expose } from 'class-transformer';
import { PaginationMeta } from '../../../../common/dto/pagination.dto';
import { NotificationResponseDto } from './notification-response.dto';

@Exclude()
export class NotificationStatsDto {
    @Expose()
    totalUnread!: number;

    @Expose()
    totalRead!: number;
}

@Exclude()
export class NotificationListResponseDto {
    @Expose()
    items!: NotificationResponseDto[];

    @Expose()
    meta!: PaginationMeta;

    @Expose()
    stats!: NotificationStatsDto;

    constructor(partial: Partial<NotificationListResponseDto>) {
        Object.assign(this, partial);
    }
}
