export class SessionDto {
    id!: string;
    deviceName!: string;
    deviceType!: string;
    browser!: string;
    os!: string;
    ipAddress!: string;
    lastActivityAt!: Date;
    createdAt!: Date;
    isActive!: boolean;
    isCurrent!: boolean;
}

export class SessionsListResponseDto {
    sessions!: SessionDto[];
    total!: number;
}
