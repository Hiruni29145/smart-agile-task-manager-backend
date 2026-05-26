import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(PrismaService.name);

    constructor(private readonly configService: ConfigService) {
        const isProduction = configService.get('NODE_ENV') === 'production';

        super({
            log: isProduction
                ? [
                    { emit: 'stdout', level: 'warn' },
                    { emit: 'stdout', level: 'error' },
                ]
                : [
                    { emit: 'event', level: 'query' },
                    { emit: 'stdout', level: 'info' },
                    { emit: 'stdout', level: 'warn' },
                    { emit: 'stdout', level: 'error' },
                ],
        });

        const extendedClient = this.$extends({
            query: {
                user: {
                    async findMany({ args, query }) {
                        if (args.where?.deletedAt === undefined) {
                            args.where = { ...args.where, deletedAt: null };
                        }
                        return query(args);
                    },
                    async findFirst({ args, query }) {
                        if (args.where?.deletedAt === undefined) {
                            args.where = { ...args.where, deletedAt: null };
                        }
                        return query(args);
                    },
                    async findUnique({ args, query }) {
                        return query(args).then(res => {
                            if (res && res.deletedAt !== null) return null;
                            return res;
                        });
                    }
                },
                notification: {
                    async findMany({ args, query }) {
                        if (args.where?.deletedAt === undefined) {
                            args.where = { ...args.where, deletedAt: null };
                        }
                        return query(args);
                    },
                    async findFirst({ args, query }) {
                        if (args.where?.deletedAt === undefined) {
                            args.where = { ...args.where, deletedAt: null };
                        }
                        return query(args);
                    },
                    async findUnique({ args, query }) {
                        return query(args).then(res => {
                            if (res && res.deletedAt !== null) return null;
                            return res;
                        });
                    }
                },
                userSession: {
                    async findMany({ args, query }) {
                        if (args.where?.deletedAt === undefined) {
                            args.where = { ...args.where, deletedAt: null };
                        }
                        return query(args);
                    },
                    async findFirst({ args, query }) {
                        if (args.where?.deletedAt === undefined) {
                            args.where = { ...args.where, deletedAt: null };
                        }
                        return query(args);
                    },
                    async findUnique({ args, query }) {
                        return query(args).then(res => {
                            if (res && res.deletedAt !== null) return null;
                            return res;
                        });
                    }
                }
            },
        });

        Object.assign(extendedClient, {
            onModuleInit: async () => {
                await this.$connect();
                this.logger.log('Database connection established');
            },
            onModuleDestroy: async () => {
                await this.$disconnect();
                this.logger.log('Database connection closed');
            }
        });

        return extendedClient as any;
    }

    async onModuleInit() {
        await this.$connect();
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}
