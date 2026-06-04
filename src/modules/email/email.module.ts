import { Module, Global, forwardRef } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'node:path';
import { EmailService } from './email.service';
import { EmailProcessor } from './email.processor';
@Global()
@Module({
    imports: [
        BullModule.registerQueueAsync({
            name: 'email',
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                redis: {
                    host: configService.get('REDIS_HOST', 'localhost'),
                    port: configService.get('REDIS_PORT', 6379),
                    password: configService.get('REDIS_PASSWORD') || undefined,
                },
                defaultJobOptions: {
                    attempts: 3,
                    backoff: {
                        type: 'exponential',
                        delay: 5000,
                    },
                    removeOnComplete: 100,
                    removeOnFail: 500,
                },
            }),
        }),

        MailerModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                const port = configService.get<number>('SMTP_PORT', 587);
                const isSecure = port === 465;

                return {
                    transport: {
                        host: configService.get<string>('SMTP_HOST', 'smtp.gmail.com'),
                        port: port,
                        secure: isSecure,
                        auth: {
                            user: configService.get<string>('SMTP_USER'),
                            pass: configService.get<string>('SMTP_PASS'),
                        },
                    },
                    defaults: {
                        from: configService.get<string>(
                            'SMTP_FROM',
                            '"Smart Agile System" <noreplynoreply@smartagile.com>',
                        ),
                    },
                    template: {
                        dir: join(__dirname, 'templates'),
                        adapter: new HandlebarsAdapter(),
                        options: {
                            strict: true,
                        },
                    },
                    options: {
                        partials: {
                            dir: join(__dirname, 'templates', 'layouts'),
                            options: {
                                strict: true,
                            },
                        },
                    },
                };
            },
        }),

    ],
    providers: [EmailService, EmailProcessor],
    exports: [EmailService],
})
export class EmailModule { }

