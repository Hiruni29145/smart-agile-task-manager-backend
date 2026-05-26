import * as crypto from 'crypto';

export function hashRefreshToken(token: string): string {
    return crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');
}

export function compareRefreshToken(
    plainToken: string,
    hashedToken: string,
): boolean {
    try {
        const hash = hashRefreshToken(plainToken);
        const hashBuffer = Buffer.from(hash);
        const storedBuffer = Buffer.from(hashedToken);

        if (hashBuffer.length !== storedBuffer.length) {
            return false;
        }

        return crypto.timingSafeEqual(hashBuffer, storedBuffer);
    } catch {
        return false;
    }
}

export function generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
}
