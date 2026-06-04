import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import type { Queue } from 'bull';
import type { EmailJobData } from './email.processor';

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);
    private readonly frontendUrl: string;
    private readonly useQueue: boolean;

    constructor(
        private readonly mailerService: MailerService,
        private readonly configService: ConfigService,
        @InjectQueue('email') private readonly emailQueue: Queue<EmailJobData>,
    ) {
        this.frontendUrl = this.configService.get<string>(
            'FRONTEND_URL',
            'http://localhost:3000',
        );
        this.useQueue = this.configService.get('REDIS_ENABLED') === 'true';
    }

    private async getBrandingContext(): Promise<Record<string, any>> {
        return { companyName: 'Smart Agile System' };
    }

    async sendPasswordResetEmail(
        email: string,
        token: string,
        firstName?: string,
    ): Promise<void> {
        const resetUrl = `${this.frontendUrl}/reset-password?token=${token}`;
        const expiryMinutes = this.configService.get<number>(
            'PASSWORD_RESET_TOKEN_EXPIRY_MINUTES',
            60,
        );
        const branding = await this.getBrandingContext();

        const jobData: EmailJobData = {
            type: 'password-reset',
            to: email,
            subject: 'Reset Your Password - Smart Agile System',
            template: 'password-reset',
            context: {
                firstName: firstName || 'User',
                resetUrl,
                expiryMinutes,
                year: new Date().getFullYear(),
                subject: 'Reset Your Password - Smart Agile System',
                ...branding,
            },
        };

        await this.sendEmail(jobData);
    }

    async sendWelcomeEmail(
        email: string,
        firstName: string,
    ): Promise<void> {
        const branding = await this.getBrandingContext();

        const jobData: EmailJobData = {
            type: 'welcome',
            to: email,
            subject: 'Welcome to Smart Agile System!',
            template: 'welcome',
            context: {
                firstName,
                loginUrl: `${this.frontendUrl}/login`,
                year: new Date().getFullYear(),
                ...branding,
            },
        };

        await this.sendEmail(jobData);
    }

    async sendPasswordChangedEmail(
        email: string,
        firstName?: string,
    ): Promise<void> {
        const branding = await this.getBrandingContext();

        const jobData: EmailJobData = {
            type: 'password-changed',
            to: email,
            subject: 'Your Password Was Changed - Smart Agile System',
            template: 'password-changed',
            context: {
                firstName: firstName || 'User',
                supportEmail: this.configService.get<string>(
                    'SUPPORT_EMAIL',
                    'support@gmail.com',
                ),
                year: new Date().getFullYear(),
                ...branding,
            },
        };

        await this.sendEmail(jobData);
    }

    async sendSupportEmail(
        fromEmail: string,
        subject: string,
        message: string,
        userName: string,
    ): Promise<void> {
        const branding = await this.getBrandingContext();
        const supportEmail = this.configService.get<string>(
            'SUPPORT_EMAIL',
            'support@gmail.com',
        );

        const jobData: EmailJobData = {
            type: 'support-inquiry',
            to: supportEmail,
            subject: subject,
            template: 'contact-support',
            context: {
                email: fromEmail,
                subject,
                message,
                userName : userName,
                firstName: 'Support Team',
                year: new Date().getFullYear(),
                ...branding,
            },
        };

        await this.sendEmail(jobData);
    }

    private async sendEmail(jobData: EmailJobData): Promise<void> {
        if (this.useQueue) {
            try {
                await this.emailQueue.add(jobData, {
                    priority: jobData.type === 'password-reset' ? 1 : 2,
                });
                this.logger.log(`Email queued: ${jobData.type} to ${jobData.to}`);
                return;
            } catch (error) {
                this.logger.warn(`Queue unavailable, sending directly: ${error instanceof Error ? error.message : 'Unknown'}`);
            }
        }

        try {
            await this.mailerService.sendMail({
                to: jobData.to,
                subject: jobData.subject,
                template: jobData.template,
                context: jobData.context,
            });
            this.logger.log(`Email sent: ${jobData.type} to ${jobData.to}`);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(`Failed to send email ${jobData.type} to ${jobData.to}: ${message}`);
        }
    }
}
