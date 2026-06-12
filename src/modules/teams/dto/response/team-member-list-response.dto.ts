import { Expose, Type } from 'class-transformer';
import { TeamMemberProfileDto } from './team-member-profile.dto';
import { PaginationMeta } from '../../../../common/dto/pagination.dto';

export class TeamMemberListResponseDto {
    @Expose()
    @Type(() => TeamMemberProfileDto)
    items!: TeamMemberProfileDto[];

    @Expose()
    @Type(() => PaginationMeta)
    meta!: PaginationMeta;

    constructor(partial: Partial<TeamMemberListResponseDto>) {
        Object.assign(this, partial);
    }
}
