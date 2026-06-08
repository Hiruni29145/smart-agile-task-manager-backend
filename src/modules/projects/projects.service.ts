import { Injectable, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateProjectRequestDto, UpdateProjectRequestDto, ProjectResponseDto, ProjectListResponseDto } from './dto';
import { NotificationType, ProjectStatus } from '@prisma/client';
import { ErrorCodes, Messages } from '../../common/constants';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class ProjectsService {
    private readonly logger = new Logger(ProjectsService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly notificationsService: NotificationsService,
    ) {}

    async create(userId: string, dto: CreateProjectRequestDto): Promise<ProjectResponseDto> {
        const existingProject = await this.prisma.project.findUnique({
            where: { key: dto.key },
        });

        if (existingProject) {
            throw new ConflictException({
                code: 'PROJECT_KEY_EXISTS',
                message: `A project with key ${dto.key} already exists.`,
            });
        }

        const project = await this.prisma.project.create({
            data: {
                name: dto.name,
                description: dto.description,
                key: dto.key,
                status: ProjectStatus.ACTIVE,
                deadline: dto.deadline ? new Date(dto.deadline) : null,
                createdById: userId,
            },
        });

        this.logger.log(`Project created: ${project.name} (${project.key}) by User ${userId}`);

        await this.notificationsService.create(
            userId,
            'Project Created',
            `Your project "${project.name}" has been created successfully.`,
            NotificationType.SUCCESS,
        );

        return new ProjectResponseDto(project);
    }

    async findAll(userId: string, query: PaginationDto): Promise<ProjectListResponseDto> {
        const { page = 1, limit = 30 } = query;
        const skip = (page - 1) * limit;

        const where = {
            deletedAt: null,
            createdById: userId, 
        };

        const [items, total] = await Promise.all([
            this.prisma.project.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.project.count({ where }),
        ]);

        const mappedItems = items.map((item) => new ProjectResponseDto(item));

        return new ProjectListResponseDto({
            items: mappedItems,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasNextPage: page < Math.ceil(total / limit),
                hasPreviousPage: page > 1,
            },
        });
    }

    async findOne(id: number): Promise<ProjectResponseDto> {
        const project = await this.prisma.project.findFirst({
            where: { id, deletedAt: null },
        });

        if (!project) {
            throw new ConflictException({
                code: ErrorCodes.RESOURCE_NOT_FOUND,
                message: 'Project not found or you do not have permission to view it.',
            });
        }

        return new ProjectResponseDto(project);
    }

    async update(userId: string, id: number, dto: UpdateProjectRequestDto): Promise<ProjectResponseDto> {
        const project = await this.prisma.project.findFirst({
            where: { id, createdById: userId, deletedAt: null },
        });

        if (!project) {
            throw new ConflictException({
                code: ErrorCodes.RESOURCE_NOT_FOUND,
                message: 'Project not found or you do not have permission to update it.',
            });
        }

        if (dto.key && dto.key !== project.key) {
            const existingProject = await this.prisma.project.findUnique({
                where: { key: dto.key },
            });

            if (existingProject) {
                throw new ConflictException({
                    code: 'PROJECT_KEY_EXISTS',
                    message: `A project with key ${dto.key} already exists.`,
                });
            }
        }

        const updatedProject = await this.prisma.project.update({
            where: { id },
            data: {
                name: dto.name,
                description: dto.description,
                key: dto.key,
                status: dto.status,
                deadline: dto.deadline ? new Date(dto.deadline) : undefined,
            },
        });

        this.logger.log(`Project updated: ${updatedProject.name} (${updatedProject.key}) by User ${userId}`);

        await this.notificationsService.create(
            userId,
            'Project Updated',
            `Your project "${updatedProject.name}" has been updated successfully.`,
            NotificationType.INFO,
        );

        return new ProjectResponseDto(updatedProject);
    }

    async softDelete(userId: string, id: number): Promise<{ message: string }> {
        const project = await this.prisma.project.findFirst({
            where: { id, createdById: userId, deletedAt: null },
        });

        if (!project) {
            throw new ConflictException({
                code: ErrorCodes.RESOURCE_NOT_FOUND,
                message: 'Project not found or you do not have permission to delete it.',
            });
        }

        await this.prisma.project.update({
            where: { id },
            data: { deletedAt: new Date() },
        });

        this.logger.log(`Project soft deleted: ${project.name} (${project.key}) by User ${userId}`);

        await this.notificationsService.create(
            userId,
            'Project Deleted',
            `Your project "${project.name}" has been deleted.`,
            NotificationType.WARNING,
        );

        return { message: 'Project deleted successfully' };
    }
}
