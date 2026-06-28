import { Expose, Type } from 'class-transformer';
import { UserRole } from '@prisma/client';
import { TaskResponseDto } from '../../../tasks/dto';

export class TeamMemberDetailsResponseDto {
    @Expose()
    id!: string;

    @Expose()
    firstName!: string;

    @Expose()
    lastName!: string;

    @Expose()
    avatar!: string | null;

    @Expose()
    role!: UserRole;

    @Expose()
    isOnline!: boolean;

    @Expose()
    openTasks!: number;

    @Expose()
    workloadPercentage!: number;

    @Expose()
    capacityStatus!: 'Healthy' | 'Overloaded';

    @Expose()
    @Type(() => TaskResponseDto)
    activeTasks!: TaskResponseDto[];

    constructor(partial: Partial<TeamMemberDetailsResponseDto>) {
        Object.assign(this, partial);
    }
}
