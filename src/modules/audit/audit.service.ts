import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AuditService {
    private readonly logger = new Logger(AuditService.name);

    constructor(private readonly prisma: PrismaService) { }

    async log(params: {
        userId?: string;
        action: string;
        entity: string;
        entityId?: string;
        oldValue?: Prisma.InputJsonValue;
        newValue?: Prisma.InputJsonValue;
        ipAddress?: string;
        userAgent?: string;
    }) {
        try {
            await this.prisma.auditLog.create({
                data: {
                    userId: params.userId,
                    action: params.action,
                    entity: params.entity,
                    entityId: params.entityId,
                    oldValue: params.oldValue,
                    newValue: params.newValue,
                    ipAddress: params.ipAddress,
                    userAgent: params.userAgent,
                },
            });
        } catch (error) {
            if (error instanceof Error) {
                this.logger.error(`Failed to create audit log: ${error.message}`, error.stack);
            } else {
                this.logger.error(`Failed to create audit log: ${String(error)}`);
            }
        }
    }
}
