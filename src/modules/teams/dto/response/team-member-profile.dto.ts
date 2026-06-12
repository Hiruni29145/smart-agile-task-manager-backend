import { Expose } from 'class-transformer';

export class TeamMemberProfileDto {
    @Expose()
    id!: string;

    @Expose()
    firstName!: string;

    @Expose()
    lastName!: string;

    @Expose()
    avatar!: string | null;

    @Expose()
    jobDescription!: string | null;

    @Expose()
    isOnline!: boolean;

    @Expose()
    openTasks!: number;

    @Expose()
    workloadPercentage!: number;

    @Expose()
    capacityStatus!: 'Healthy' | 'Overloaded';

    constructor(partial: Partial<TeamMemberProfileDto>) {
        Object.assign(this, partial);
    }
}
