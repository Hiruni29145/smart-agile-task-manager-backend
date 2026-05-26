import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import type { Job } from 'bull';

export interface EmailJobData {
    type: 'password-reset' | 'welcome' | 'password-changed' | 'support-inquiry';
    to: string;
    subject: string;
    template: string;
    context: Record<string, unknown>;
}

@Processor('email')
export class EmailProcessor {
    private readonly logger = new Logger(EmailProcessor.name);

    constructor(private readonly mailerService: MailerService) { }

    @Process()
    async handleEmail(job: Job<EmailJobData>): Promise<void> {
        const { to, subject, template, context, type } = job.data;

        this.logger.log(`Processing email job ${job.id}: ${type} to ${to}`);

        try {
            await this.mailerService.sendMail({
                to,
                subject,
                template,
                context,
            });

            this.logger.log(`Email sent successfully: ${type} to ${to}`);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(`Failed to send email ${type} to ${to}: ${message}`);
            throw error;
        }
    }
}
