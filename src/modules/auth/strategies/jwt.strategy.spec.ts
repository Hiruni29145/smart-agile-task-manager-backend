import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { PrismaService } from '../../../database/prisma.service';
import { SessionService } from '../session.service';
import { UserStatus, UserRole } from '../../../common/enums';

describe('JwtStrategy', () => {
    let strategy: JwtStrategy;
    let prismaService: PrismaService;

    const mockPrismaService = {
        user: {
            findUnique: jest.fn(),
        },
    };

    const mockConfigService = {
        get: jest.fn((key: string) => {
            if (key === 'JWT_ACCESS_SECRET') return 'test-access-secret';
            return undefined;
        }),
    };

    const mockSessionService = {
        hasActiveSession: jest.fn().mockResolvedValue(true),
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
                JwtStrategy,
                { provide: PrismaService, useValue: mockPrismaService },
                { provide: ConfigService, useValue: mockConfigService },
                { provide: SessionService, useValue: mockSessionService },
            ],
        }).compile();

        strategy = module.get<JwtStrategy>(JwtStrategy);
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
            role: UserRole.USER,
        };

        it('should validate and return user for valid payload', async () => {
            mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

            const result = await strategy.validate(payload);

            expect(prismaService.user.findUnique).toHaveBeenCalledWith({
                where: { id: payload.sub },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    role: true,
                    status: true,
                    deletedAt: true,
                },
            });
            expect(result).toEqual({
                id: mockUser.id,
                email: mockUser.email,
                firstName: mockUser.firstName,
                lastName: mockUser.lastName,
                role: mockUser.role,
                status: mockUser.status,
            });
        });

        it('should throw UnauthorizedException if user not found', async () => {
            mockPrismaService.user.findUnique.mockResolvedValue(null);

            await expect(strategy.validate(payload)).rejects.toThrow(UnauthorizedException);
        });

        it('should throw UnauthorizedException if user is deleted', async () => {
            const deletedUser = { ...mockUser, deletedAt: new Date() };
            mockPrismaService.user.findUnique.mockResolvedValue(deletedUser);

            await expect(strategy.validate(payload)).rejects.toThrow(UnauthorizedException);
        });

        it('should throw UnauthorizedException if user is not active', async () => {
            const inactiveUser = { ...mockUser, status: UserStatus.SUSPENDED };
            mockPrismaService.user.findUnique.mockResolvedValue(inactiveUser);

            await expect(strategy.validate(payload)).rejects.toThrow(UnauthorizedException);
        });
    });
});
