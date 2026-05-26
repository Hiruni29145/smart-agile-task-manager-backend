import { Controller, Post, Get, Put, Delete, Body, Param, UseGuards, Req, } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import * as express from 'express';
import { AuthService } from './auth.service';
import { SessionService } from './session.service';
import { RegisterRequestDto, LoginRequestDto, RefreshTokenRequestDto, ForgotPasswordRequestDto, ResetPasswordRequestDto, ChangePasswordRequestDto, UpdateProfileRequestDto } from './dto/request';
import { LoginResponseDto, RegisterResponseDto, UserResponseDto, TokensResponseDto, SessionsListResponseDto, } from './dto/response';
import { SuccessResponseDto } from '../../common/dto';
import { Public, CurrentUser } from '../../common/decorators';
import { JwtRefreshGuard } from '../../common/guards';
import type { AuthenticatedUser } from '../../common/interfaces';
import { extractDeviceInfo } from '../../common/utils';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly sessionService: SessionService,
    ) { }

    @Public()
    @Post('register')
    async register(
        @Body() registerDto: RegisterRequestDto,
        @Req() req: express.Request,
    ): Promise<RegisterResponseDto> {
        const deviceInfo = extractDeviceInfo(req);
        return this.authService.register(registerDto, deviceInfo);
    }

    @Public()
    @Throttle({ default: { limit: 5, ttl: 60000 } })
    @Post('login')
    async login(
        @Body() loginDto: LoginRequestDto,
        @Req() req: express.Request,
    ): Promise<LoginResponseDto> {
        const deviceInfo = extractDeviceInfo(req);
        return this.authService.login(loginDto, deviceInfo);
    }

    @Public()
    @UseGuards(JwtRefreshGuard)
    @Post('refresh')
    async refreshTokens(
        @Body() refreshTokenDto: RefreshTokenRequestDto,
        @CurrentUser() user: AuthenticatedUser,
        @Req() req: express.Request,
    ): Promise<TokensResponseDto> {
        const deviceInfo = extractDeviceInfo(req);
        return this.authService.refreshTokens(user.id, refreshTokenDto.refreshToken, deviceInfo);
    }

    @Post('logout')
    @UseGuards(JwtAuthGuard)
    async logout(@CurrentUser() user: AuthenticatedUser): Promise<SuccessResponseDto> {
        return this.authService.logout(user.id);
    }

    @Public()
    @Post('forgot/password')
    async forgotPassword(
        @Body() forgotPasswordDto: ForgotPasswordRequestDto,
    ): Promise<SuccessResponseDto> {
        return this.authService.forgotPassword(forgotPasswordDto.email);
    }

    @Public()
    @Post('reset/password')
    async resetPassword(
        @Body() resetPasswordDto: ResetPasswordRequestDto,
    ): Promise<SuccessResponseDto> {
        return this.authService.resetPassword(
            resetPasswordDto.token,
            resetPasswordDto.newPassword,
        );
    }

    @Post('change/password')
    @UseGuards(JwtAuthGuard)
    async changePassword(
        @CurrentUser() user: AuthenticatedUser,
        @Body() changePasswordDto: ChangePasswordRequestDto,
    ): Promise<SuccessResponseDto> {
        return this.authService.changePassword(user.id, changePasswordDto);
    }

    @Put('profile/update')
    @UseGuards(JwtAuthGuard)
    async updateProfile(
        @CurrentUser() user: AuthenticatedUser,
        @Body() updateProfileDto: UpdateProfileRequestDto,
    ): Promise<SuccessResponseDto> {
        return this.authService.updateProfile(user.id, updateProfileDto);
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    async getProfile(@CurrentUser() user: AuthenticatedUser): Promise<UserResponseDto> {
        return this.authService.getProfile(user.id);
    }

    @Get('sessions')
    async getSessions(@CurrentUser() user: AuthenticatedUser): Promise<SessionsListResponseDto> {
        const sessions = await this.sessionService.getActiveSessions(user.id);
        return {
            sessions,
            total: sessions.length,
        };
    }

    @Delete('sessions/:sessionId')
    @UseGuards(JwtAuthGuard)
    async revokeSession(
        @CurrentUser() user: AuthenticatedUser,
        @Param('sessionId') sessionId: string,
    ): Promise<SuccessResponseDto> {
        return this.sessionService.revokeSession(user.id, sessionId);
    }

    @Post('sessions/revoke-all')
    @UseGuards(JwtAuthGuard)
    async revokeAllSessions(@CurrentUser() user: AuthenticatedUser): Promise<SuccessResponseDto> {
        return this.sessionService.revokeAllSessions(user.id);
    }
}
