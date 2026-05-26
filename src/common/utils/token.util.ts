import * as crypto from 'crypto';

export function generateRandomToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
}

export function generateResetToken(): string {
    return generateRandomToken(32);
}

export function getTokenExpiryDate(minutes: number = 60): Date {
    return new Date(Date.now() + minutes * 60 * 1000);
}

export function isTokenExpired(expiryDate: Date | null): boolean {
    if (!expiryDate) return true;
    return new Date() > expiryDate;
}
