import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DeveloperService } from './developer.service';
import { GetMyTasksQueryDto } from './dto';
import { TaskListResponseDto } from '../tasks/dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { User } from '@prisma/client';

@Controller('developer')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DeveloperController {
    constructor(private readonly developerService: DeveloperService) {}

    @Get('tasks')
    @Roles(UserRole.DEVELOPER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
    async getMyTasks(
        @Query() query: GetMyTasksQueryDto,
        @CurrentUser() user: User,
    ): Promise<TaskListResponseDto> {
        return this.developerService.getMyTasks(user.id, query);
    }
}
