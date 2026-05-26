import * as express from 'express';
import { UAParser } from 'ua-parser-js';

export interface DeviceInfo {
    deviceName: string;
    deviceType: 'DESKTOP' | 'MOBILE' | 'TABLET' | 'UNKNOWN';
    browser: string;
    os: string;
    ipAddress: string;
    userAgent: string;
}

export function extractDeviceInfo(req: express.Request): DeviceInfo {
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const parser = new UAParser(userAgent);
    const result = parser.getResult();

    let deviceType: DeviceInfo['deviceType'] = 'UNKNOWN';
    if (result.device.type === 'mobile') {
        deviceType = 'MOBILE';
    } else if (result.device.type === 'tablet') {
        deviceType = 'TABLET';
    } else if (result.device.type === undefined && result.os.name) {
        deviceType = 'DESKTOP';
    }

    const deviceName = result.device.model ||
        result.device.vendor ||
        `${result.browser.name || 'Unknown'} on ${result.os.name || 'Unknown'}`;

    const browser = result.browser.name
        ? `${result.browser.name} ${result.browser.version || ''}`
        : 'Unknown Browser';

    const os = result.os.name
        ? `${result.os.name} ${result.os.version || ''}`
        : 'Unknown OS';

    const ipAddress = getClientIp(req);

    return {
        deviceName,
        deviceType,
        browser,
        os,
        ipAddress,
        userAgent,
    };
}

export function getClientIp(req: express.Request): string {
    const forwardedFor = req.headers['x-forwarded-for'];
    if (forwardedFor) {
        const ips = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor;
        return ips.split(',')[0].trim();
    }

    const realIp = req.headers['x-real-ip'];
    if (realIp) {
        return Array.isArray(realIp) ? realIp[0] : realIp;
    }

    return req.ip || req.socket.remoteAddress || 'Unknown';
}

export function generateDeviceIdentifier(deviceInfo: DeviceInfo): string {
    return `${deviceInfo.deviceType} - ${deviceInfo.browser} - ${deviceInfo.os}`;
}
