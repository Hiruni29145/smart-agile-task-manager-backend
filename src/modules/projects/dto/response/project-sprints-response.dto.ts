import { Expose, Type } from 'class-transformer';
import { ProjectSprintWithTasksDto } from './project-sprint-with-tasks.dto';

export class ProjectSprintsResponseDto {
    @Expose()
    @Type(() => ProjectSprintWithTasksDto)
    sprints!: ProjectSprintWithTasksDto[];

    constructor(partial: Partial<ProjectSprintsResponseDto>) {
        Object.assign(this, partial);
    }
}
