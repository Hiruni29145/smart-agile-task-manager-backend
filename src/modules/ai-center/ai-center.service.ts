import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateAiEstimationDto, UpdateAiEstimationDto, AiEstimationResponseDto } from './dto';
import { PaginationDto, PaginatedResponse } from '../../common/dto/pagination.dto';

@Injectable()
export class AiCenterService {
    constructor(private readonly prisma: PrismaService) {}

    async createEstimation(userId: string, dto: CreateAiEstimationDto): Promise<AiEstimationResponseDto> {
        const estimation = await this.prisma.aiEstimation.create({
            data: {
                ...dto,
                createdById: userId,
            },
        });
        return new AiEstimationResponseDto(estimation);
    }

    async getEstimations(userId: string, query: PaginationDto): Promise<PaginatedResponse<AiEstimationResponseDto>> {
        const page = query.page || 1;
        const limit = query.limit || 10;
        const skip = (page - 1) * limit;

        const [total, estimations] = await Promise.all([
            this.prisma.aiEstimation.count({
                where: { createdById: userId, deletedAt: null },
            }),
            this.prisma.aiEstimation.findMany({
                where: { createdById: userId, deletedAt: null },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
        ]);

        const items = estimations.map(e => new AiEstimationResponseDto(e));
        return new PaginatedResponse(items, total, page, limit);
    }

    async getEstimationById(userId: string, id: number): Promise<AiEstimationResponseDto> {
        const estimation = await this.prisma.aiEstimation.findFirst({
            where: { id, createdById: userId, deletedAt: null },
        });

        if (!estimation) {
            throw new NotFoundException('Estimation not found');
        }

        return new AiEstimationResponseDto(estimation);
    }

    async updateEstimation(userId: string, id: number, dto: UpdateAiEstimationDto): Promise<AiEstimationResponseDto> {
        const estimation = await this.getEstimationById(userId, id);

        const updated = await this.prisma.aiEstimation.update({
            where: { id: estimation.id },
            data: dto,
        });

        return new AiEstimationResponseDto(updated);
    }

    async deleteEstimation(userId: string, id: number): Promise<{ message: string }> {
        const estimation = await this.getEstimationById(userId, id);

        await this.prisma.aiEstimation.update({
            where: { id: estimation.id },
            data: { deletedAt: new Date() },
        });

        return { message: 'Estimation deleted successfully' };
    }
}
