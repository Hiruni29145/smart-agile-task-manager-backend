import { Expose, Type } from 'class-transformer';
import { SprintResponseDto } from '../../../sprints/dto';
import { TaskResponseDto } from '../../../tasks/dto';

export class ProjectSprintWithTasksDto extends SprintResponseDto {
    @Expose()
    @Type(() => TaskResponseDto)
    tasks!: TaskResponseDto[];

    constructor(partial: Partial<ProjectSprintWithTasksDto>) {
        super(partial);
        Object.assign(this, partial);
    }
}
