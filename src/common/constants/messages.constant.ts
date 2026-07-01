export const Messages = {
    // Auth
    AUTH_LOGIN_SUCCESS: 'Login successful',
    AUTH_REGISTER_SUCCESS: 'Registration successful',
    AUTH_LOGOUT_SUCCESS: 'Logout successful',
    AUTH_REFRESH_SUCCESS: 'Token refreshed successfully',
    AUTH_PASSWORD_RESET_REQUESTED: 'Password reset instructions sent to your email',
    AUTH_PASSWORD_RESET_SUCCESS: 'Password reset successful',
    AUTH_PASSWORD_CHANGE_SUCCESS: 'Password changed successfully',
    AUTH_INVALID_CREDENTIALS: 'Invalid email or password',
    AUTH_USER_EXISTS: 'User with this email already exists',
    AUTH_ACCOUNT_LOCKED: 'Account is locked. Please try again later',
    AUTH_ACCOUNT_INACTIVE: 'Account is inactive. Please contact support',
    AUTH_ACCOUNT_SUSPENDED: 'Account is suspended. Please contact support',
    AUTH_TOKEN_EXPIRED: 'Token has expired',
    AUTH_TOKEN_INVALID: 'Invalid token',
    AUTH_UNAUTHORIZED: 'Unauthorized access',
    AUTH_SESSION_CREATED: 'Session created successfully',
    AUTH_SESSION_REVOKED: 'Session revoked successfully',
    AUTH_ALL_SESSIONS_REVOKED: 'All sessions revoked successfully',
    AUTH_SESSION_EXPIRED: 'Session has expired',
    AUTH_SESSION_INVALID: 'Invalid session',
    AUTH_MAX_SESSIONS_EXCEEDED: 'Maximum number of active sessions exceeded',
    AUTH_RESET_TOKEN_INVALID: 'Invalid reset token',
    AUTH_RESET_TOKEN_EXPIRED: 'Reset token has expired',
    AUTH_PASSWORD_MISMATCH: 'Current password is incorrect',


    // User
    USER_FOUND: 'User retrieved successfully',
    USER_LIST: 'Users retrieved successfully',
    USER_CREATED: 'User created successfully',
    USER_UPDATED: 'User updated successfully',
    USER_DELETED: 'User deleted successfully',
    USER_RESTORED: 'User restored successfully',
    USER_NOT_FOUND: 'User not found',
    USER_STATUS_UPDATED: 'User status updated successfully',

    // General
    SUCCESS: 'Operation completed successfully',
    VALIDATION_FAILED: 'Validation failed',
    INTERNAL_ERROR: 'An internal error occurred',
    RATE_LIMIT_EXCEEDED: 'Too many requests. Please try again later',
    FORBIDDEN: 'You do not have permission to perform this action',

    // Notifications
    NOTIFICATION_MARKED_READ: 'Notification marked as read',
    NOTIFICATION_ALL_MARKED_READ: 'All notifications marked as read',
    NOTIFICATION_ADDED_FAVORITE: 'Notification added to favorites',
    NOTIFICATION_REMOVED_FAVORITE: 'Notification removed from favorites',
    NOTIFICATION_DELETED: 'Notification deleted',
    NOTIFICATION_ALL_DELETED: 'All notifications deleted',
    NOTIFICATION_NOT_FOUND: 'Notification not found',

    // Social Media
    SOCIAL_MEDIA_CREATED: 'Social media link created successfully',
    SOCIAL_MEDIA_UPDATED: 'Social media link updated successfully',
    SOCIAL_MEDIA_DELETED: 'Social media link deleted successfully',

    // Admin
    ADMIN_USERS_FETCHED: 'Users fetched successfully',

    // Dashboard
    DASHBOARD_STATS_RETRIEVED: 'Dashboard statistics retrieved',

    // Storage
    STORAGE_CREDENTIALS_MISSING: 'Storage credentials are not configured properly',
    STORAGE_CONFIG_MISSING: 'Storage configuration is missing',
    STORAGE_UPLOAD_PROFILE_SUCCESS: 'Profile image uploaded successfully',
    STORAGE_UPLOAD_IMAGE_SUCCESS: 'Image uploaded successfully',
    STORAGE_UPLOAD_ASSET_SUCCESS: 'Asset uploaded successfully',
    STORAGE_NO_FILE: 'No file provided',
    STORAGE_UPLOAD_FAILED: 'File upload failed',
} as const;

export type Message = (typeof Messages)[keyof typeof Messages];
