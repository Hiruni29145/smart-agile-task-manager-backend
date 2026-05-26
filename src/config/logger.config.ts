import { registerAs } from '@nestjs/config';

export type LogLevel = 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';

export default registerAs('logger', () => ({
    level: (process.env.LOG_LEVEL || 'info') as LogLevel,
    prettyPrint: process.env.NODE_ENV !== 'production',
    redact: [
        'req.headers.authorization',
        'req.headers.cookie',
        'req.body.password',
        'req.body.currentPassword',
        'req.body.newPassword',
        'req.body.confirmPassword',
        'req.body.token',
        'req.body.refreshToken',
    ],
}));
