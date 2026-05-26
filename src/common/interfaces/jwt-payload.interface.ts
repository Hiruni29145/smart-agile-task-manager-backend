import { UserRole } from '../enums';

export interface JwtPayload {
    sub: string; // User ID
    email: string;
    role: UserRole;
    iat?: number;
    exp?: number;
}
