import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Auth (e2e)', () => {
    let app: INestApplication;
    let accessToken: string;
    let refreshToken: string;

    const testEmail = `e2e-test-${Date.now()}@example.com`;
    const testPassword = 'TestPass@123';

    const apiPrefix = process.env.API_PREFIX || '';
    const authPath = apiPrefix ? `/${apiPrefix}/auth` : '/auth';

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();

        app.useGlobalPipes(
            new ValidationPipe({
                whitelist: true,
                forbidNonWhitelisted: true,
                transform: true,
            }),
        );

        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    describe('POST /auth/register', () => {
        it('should register a new user', async () => {
            const res = await request(app.getHttpServer())
                .post(`${authPath}/register`)
                .send({
                    email: testEmail,
                    password: testPassword,
                    firstName: 'E2E',
                    lastName: 'Test',
                });

            if (res.status !== 201) {
                console.log('Register failed:', res.status, res.body);
            }

            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty('user');
            expect(res.body).toHaveProperty('tokens');
            expect(res.body.user.email).toBe(testEmail);
            expect(res.body.tokens).toHaveProperty('accessToken');
            expect(res.body.tokens).toHaveProperty('refreshToken');

            accessToken = res.body.tokens.accessToken;
            refreshToken = res.body.tokens.refreshToken;
        });

        it('should reject duplicate email', async () => {
            if (!accessToken) {
                console.log('Skipping: Registration failed');
                return;
            }

            const res = await request(app.getHttpServer())
                .post(`${authPath}/register`)
                .send({
                    email: testEmail,
                    password: testPassword,
                    firstName: 'E2E',
                    lastName: 'Test',
                });

            expect(res.status).toBe(409);
        });

        it('should reject invalid email format', async () => {
            const res = await request(app.getHttpServer())
                .post(`${authPath}/register`)
                .send({
                    email: 'invalid-email',
                    password: testPassword,
                    firstName: 'Test',
                    lastName: 'User',
                });

            expect(res.status).toBe(400);
        });

        it('should reject weak password', async () => {
            const res = await request(app.getHttpServer())
                .post(`${authPath}/register`)
                .send({
                    email: 'another@example.com',
                    password: 'weak',
                    firstName: 'Test',
                    lastName: 'User',
                });

            expect(res.status).toBe(400);
        });
    });

    describe('POST /auth/login', () => {
        it('should login with valid credentials', async () => {
            if (!accessToken) {
                console.log('Skipping: No valid registration');
                return;
            }

            const res = await request(app.getHttpServer())
                .post(`${authPath}/login`)
                .send({
                    email: testEmail,
                    password: testPassword,
                });

            if (res.status !== 200) {
                console.log('Login failed:', res.status, res.body);
            }

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('user');
            expect(res.body).toHaveProperty('tokens');

            accessToken = res.body.tokens.accessToken;
            refreshToken = res.body.tokens.refreshToken;
        });

        it('should reject invalid password', async () => {
            const res = await request(app.getHttpServer())
                .post(`${authPath}/login`)
                .send({
                    email: testEmail,
                    password: 'WrongPassword@123',
                });

            expect(res.status).toBe(401);
        });

        it('should reject non-existent user', async () => {
            const res = await request(app.getHttpServer())
                .post(`${authPath}/login`)
                .send({
                    email: 'nonexistent@example.com',
                    password: testPassword,
                });

            expect(res.status).toBe(401);
        });
    });

    describe('GET /auth/me (Protected)', () => {
        it('should return user profile with valid token', async () => {
            if (!accessToken) {
                console.log('Skipping: No valid token');
                return;
            }

            const res = await request(app.getHttpServer())
                .get(`${authPath}/me`)
                .set('Authorization', `Bearer ${accessToken}`);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('id');
            expect(res.body).toHaveProperty('email');
        });

        it('should reject request without token', async () => {
            const res = await request(app.getHttpServer())
                .get(`${authPath}/me`);

            expect(res.status).toBe(401);
        });

        it('should reject request with invalid token', async () => {
            const res = await request(app.getHttpServer())
                .get(`${authPath}/me`)
                .set('Authorization', 'Bearer invalid-token');

            expect(res.status).toBe(401);
        });
    });

    describe('POST /auth/refresh', () => {
        it('should refresh tokens with valid refresh token', async () => {
            if (!refreshToken) {
                console.log('Skipping: No valid refresh token');
                return;
            }

            const res = await request(app.getHttpServer())
                .post(`${authPath}/refresh`)
                .send({ refreshToken });

            if (res.status === 200) {
                accessToken = res.body.accessToken;
                refreshToken = res.body.refreshToken;
            }

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('accessToken');
            expect(res.body).toHaveProperty('refreshToken');
        });

        it('should reject invalid refresh token', async () => {
            const res = await request(app.getHttpServer())
                .post(`${authPath}/refresh`)
                .send({ refreshToken: 'invalid-refresh-token' });

            expect(res.status).toBe(401);
        });
    });

    describe('GET /auth/sessions', () => {
        it('should return active sessions', async () => {
            if (!accessToken) {
                console.log('Skipping: No valid token');
                return;
            }

            const res = await request(app.getHttpServer())
                .get(`${authPath}/sessions`)
                .set('Authorization', `Bearer ${accessToken}`);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('sessions');
            expect(res.body).toHaveProperty('total');
        });
    });

    describe('POST /auth/forgot-password', () => {
        it('should accept forgot password request', async () => {
            const res = await request(app.getHttpServer())
                .post(`${authPath}/forgot-password`)
                .send({ email: testEmail });

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('message');
        });

        it('should not reveal if email exists', async () => {
            const res = await request(app.getHttpServer())
                .post(`${authPath}/forgot-password`)
                .send({ email: 'nonexistent@example.com' });

            expect(res.status).toBe(200);
        });
    });

    describe('POST /auth/logout', () => {
        it('should logout user', async () => {
            if (!accessToken) {
                console.log('Skipping: No valid token');
                return;
            }

            const res = await request(app.getHttpServer())
                .post(`${authPath}/logout`)
                .set('Authorization', `Bearer ${accessToken}`);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('message');
        });
    });
});
