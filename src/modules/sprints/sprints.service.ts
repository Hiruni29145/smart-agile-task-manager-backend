import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateSprintRequestDto, UpdateSprintRequestDto, SprintResponseDto, SprintListResponseDto } from './dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { ErrorCodes } from '../../common/constants';

@Injectable()
export class SprintsService {
    constructor(private readonly prisma: PrismaService) {}

    async create(createDto: CreateSprintRequestDto): Promise<{ message: string }> {
        await this.prisma.sprint.create({
            data: {
                name: createDto.name,
                sprintNo: createDto.sprintNo,
                projectId: createDto.projectId,
                startDate: createDto.startDate ? new Date(createDto.startDate) : null,
                endDate: createDto.endDate ? new Date(createDto.endDate) : null,
                status: createDto.status,
            },
        });

        return { message: 'Sprint created successfully' };
    }

    async findAll(projectId: number | undefined, query: PaginationDto): Promise<SprintListResponseDto> {
        const page = query.page || 1;
        const limit = query.limit || 30;
        const skip = (page - 1) * limit;

        const whereCondition: any = {
            deletedAt: null,
        };

        if (projectId !== undefined) {
            whereCondition.projectId = projectId;
        }

        const [sprints, total] = await Promise.all([
            this.prisma.sprint.findMany({
                where: whereCondition,
                skip,
                take: limit,
                orderBy: { sprintNo: 'desc' },
            }),
            this.prisma.sprint.count({ where: whereCondition }),
        ]);

        const totalPages = Math.ceil(total / limit);

        return new SprintListResponseDto({
            items: sprints.map((sprint) => new SprintResponseDto(sprint)),
            meta: {
                page,
                limit,
                total,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
            },
        });
    }

    async findOne(id: number): Promise<SprintResponseDto> {
        const sprint = await this.prisma.sprint.findUnique({
            where: { id, deletedAt: null },
            include: {
                tasks: {
                    where: { deletedAt: null },
                    select: {
                        estimatedTime: true,
                        storyPoints: true,
                    },
                },
            },
        });

        if (!sprint) {
            throw new NotFoundException({
                code: ErrorCodes.RESOURCE_NOT_FOUND,
                message: 'Sprint not found.',
            });
        }

        const estimatedWorkload = sprint.tasks.reduce((sum, task) => sum + (task.estimatedTime || 0), 0);
        const storyPoints = sprint.tasks.reduce((sum, task) => sum + (task.storyPoints || 0), 0);

        return new SprintResponseDto({
            ...sprint,
            estimatedWorkload,
            storyPoints,
        });
    }

    async update(id: number, updateDto: UpdateSprintRequestDto): Promise<{ message: string }> {
        await this.findOne(id); // Ensure exists

        await this.prisma.sprint.update({
            where: { id },
            data: {
                name: updateDto.name,
                sprintNo: updateDto.sprintNo,
                startDate: updateDto.startDate ? new Date(updateDto.startDate) : undefined,
                endDate: updateDto.endDate ? new Date(updateDto.endDate) : undefined,
                status: updateDto.status,
            },
        });

        return { message: 'Sprint updated successfully' };
    }

    async softDelete(id: number): Promise<{ message: string }> {
        await this.findOne(id);

        await this.prisma.sprint.update({
            where: { id },
            data: { deletedAt: new Date() },
        });

        return { message: 'Sprint deleted successfully' };
    }
}
