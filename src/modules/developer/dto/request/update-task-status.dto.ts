import { IsEnum, IsNotEmpty } from 'class-validator';
import { TaskStatus } from '@prisma/client';

export class UpdateTaskStatusDto {
    @IsNotEmpty()
    @IsEnum(TaskStatus)
    status!: TaskStatus;
}
