export interface Tokens {
    accessToken: string;
    refreshToken: string;
}

export interface JwtPayloadWithRefresh {
    sub: string;
    email: string;
    refreshToken: string;
}
