import { Module, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { LoggerModule } from 'nestjs-pino';
import { redisStore } from 'cache-manager-redis-yet';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseModule } from './database';
import { AuthModule } from './modules/auth';
import { HealthModule } from './modules/health';
import { EmailModule } from './modules/email';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AuditModule } from './modules/audit/audit.module';
import { AdminModule } from './modules/admin/admin.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { SprintsModule } from './modules/sprints/sprints.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { TeamsModule } from './modules/teams/teams.module';
import { StorageModule } from './modules/storage/storage.module';
import { DeveloperModule } from './modules/developer/developer.module';
import { JwtAuthGuard } from './common/guards';
import { appConfig, jwtConfig, throttleConfig, supabaseConfig, cacheConfig, loggerConfig, validateEnv, } from './config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.development', '.env'],
      load: [appConfig, jwtConfig, throttleConfig, supabaseConfig, cacheConfig, loggerConfig],
      validate: validateEnv,
    }),

    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isProduction = configService.get('NODE_ENV') === 'production';
        const logLevel = configService.get('logger.level') || 'info';

        return {
          pinoHttp: {
            level: logLevel,
            genReqId: (req: any) => {
              const existingId = req.headers['x-correlation-id'] || req.headers['x-request-id'];
              return (existingId as string) || uuidv4();
            },
            redact: {
              paths: [
                'req.headers.authorization',
                'req.headers.cookie',
                'req.body.password',
                'req.body.currentPassword',
                'req.body.newPassword',
                'req.body.confirmPassword',
                'req.body.token',
                'req.body.refreshToken',
              ],
              censor: '[REDACTED]',
            },
            serializers: {
              req: (req: any) => ({
                id: req.id,
                method: req.method,
                url: req.url,
                query: req.query,
                params: req.params,
                ...(isProduction ? {} : { body: req.raw?.body }),
              }),
              res: (res) => ({
                statusCode: res.statusCode,
              }),
            },
            transport: isProduction
              ? undefined
              : {
                target: 'pino-pretty',
                options: {
                  colorize: true,
                  levelFirst: true,
                  translateTime: 'SYS:standard',
                  ignore: 'pid,hostname',
                },
              },
            customProps: () => ({
              context: 'HTTP',
              service: 'tour-web-system-backend',
              environment: isProduction ? 'production' : 'development',
            }),
            autoLogging: {
              ignore: (req) => {
                return isProduction && (req.url?.includes('/health') ?? false);
              },
            },
          },
          forRoutes: [{ path: '*path', method: RequestMethod.ALL }],
        };
      },
    }),

    ThrottlerModule.forRoot([
      {
        ttl: Number.parseInt(process.env.THROTTLE_TTL || '60000', 10),
        limit: Number.parseInt(process.env.THROTTLE_LIMIT || '100', 10),
      },
    ]),

    ScheduleModule.forRoot(),

    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const isEnabled = configService.get('cache.isEnabled');
        const ttl = configService.get('cache.ttl') * 1000;
        const max = configService.get('cache.max');

        if (!isEnabled) {
          return { ttl, max };
        }

        try {
          const store = await redisStore({
            socket: {
              host: configService.get('cache.host'),
              port: configService.get('cache.port'),
            },
            password: configService.get('cache.password'),
            ttl,
          });

          return { store, ttl, max };
        } catch {
          return { ttl, max };
        }
      },
    }),

    DatabaseModule,
    EmailModule,
    AuthModule,
    HealthModule,
    NotificationsModule,
    AuditModule,
    AdminModule,
    ProjectsModule,
    SprintsModule,
    TasksModule,
    DashboardModule,
    TeamsModule,
    StorageModule,
    DeveloperModule,
  ],
  
  providers: [
    // Global JWT guard
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Global throttler guard
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule { }
