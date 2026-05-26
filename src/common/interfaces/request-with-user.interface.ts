import { Request } from 'express';
import { UserRole, UserStatus } from '../enums';

export interface AuthenticatedUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    status: UserStatus;
}

export interface RequestWithUser extends Request {
    user: AuthenticatedUser;
}
