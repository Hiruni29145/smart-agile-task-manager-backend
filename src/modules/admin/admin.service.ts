import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ListUsersQueryDto } from './dto/request';
import { AdminUserListResponseDto, AdminUserResponseDto } from './dto/response';
import { Prisma } from '@prisma/client';
import { Messages } from '../../common/constants/messages.constant';

@Injectable()
export class AdminService {
    constructor(private readonly prisma: PrismaService) { }

    async findAllUsers(query: ListUsersQueryDto): Promise<AdminUserListResponseDto> {
        const { page = 1, limit = 30, role, status, search } = query;
        const skip = (page - 1) * limit;

        // Build where clause
        const where: Prisma.UserWhereInput = {
            deletedAt: null,
        };

        if (role) {
            where.role = role;
        }

        if (status) {
            where.status = status;
        }

        if (search) {
            where.OR = [
                { email: { contains: search, mode: 'insensitive' } },
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    phone: true,
                    avatar: true,
                    role: true,
                    status: true,
                    lastLoginAt: true,
                    createdAt: true,
                },
            }),
            this.prisma.user.count({ where }),
        ]);

        const totalPages = Math.ceil(total / limit);

        return new AdminUserListResponseDto({
            users: users.map((user) => new AdminUserResponseDto(user)),
            total,
            page,
            limit,
            totalPages,
            message: Messages.ADMIN_USERS_FETCHED,
        });
    }
}
