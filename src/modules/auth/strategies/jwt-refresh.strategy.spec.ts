import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtRefreshStrategy } from './jwt-refresh.strategy';
import { PrismaService } from '../../../database/prisma.service';
import { UserStatus } from '../../../common/enums';

describe('JwtRefreshStrategy', () => {
    let strategy: JwtRefreshStrategy;
    let prismaService: PrismaService;

    const mockPrismaService = {
        user: {
            findUnique: jest.fn(),
        },
    };

    const mockConfigService = {
        get: jest.fn((key: string) => {
            if (key === 'JWT_REFRESH_SECRET') return 'test-refresh-secret';
            return undefined;
        }),
    };

    const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'USER',
        status: UserStatus.ACTIVE,
        deletedAt: null,
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                JwtRefreshStrategy,
                { provide: PrismaService, useValue: mockPrismaService },
                { provide: ConfigService, useValue: mockConfigService },
            ],
        }).compile();

        strategy = module.get<JwtRefreshStrategy>(JwtRefreshStrategy);
        prismaService = module.get<PrismaService>(PrismaService);

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(strategy).toBeDefined();
    });

    describe('validate', () => {
        const payload = {
            sub: 'user-123',
            email: 'test@example.com',
            role: 'USER' as any,
        };

        const mockRequest = {
            body: {
                refreshToken: 'test-refresh-token',
            },
        } as any;

        it('should validate and return user for valid payload', async () => {
            mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

            const result = await strategy.validate(mockRequest, payload);

            expect(prismaService.user.findUnique).toHaveBeenCalledWith({
                where: { id: payload.sub },
                select: {
                    id: true,
                    email: true,
                    deletedAt: true,
                },
            });
            expect(result).toEqual({
                id: mockUser.id,
                email: mockUser.email,
                refreshToken: 'test-refresh-token',
            });
        });

        it('should throw UnauthorizedException if user not found', async () => {
            mockPrismaService.user.findUnique.mockResolvedValue(null);

            await expect(strategy.validate(mockRequest, payload)).rejects.toThrow(UnauthorizedException);
        });

        it('should throw UnauthorizedException if user is deleted', async () => {
            const deletedUser = { ...mockUser, deletedAt: new Date() };
            mockPrismaService.user.findUnique.mockResolvedValue(deletedUser);

            await expect(strategy.validate(mockRequest, payload)).rejects.toThrow(UnauthorizedException);
        });
    });
});
