import { registerAs } from '@nestjs/config';

export default registerAs('cache', () => ({
    host: process.env.REDIS_HOST || 'localhost',
    port: Number.parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    ttl: Number.parseInt(process.env.CACHE_TTL || '300', 10),
    max: Number.parseInt(process.env.CACHE_MAX_ITEMS || '1000', 10),
    isEnabled: process.env.REDIS_ENABLED !== 'false',
}));
