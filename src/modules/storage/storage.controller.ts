import { Controller, Post, UseInterceptors, UploadedFile, UseGuards, ParseFilePipeBuilder, HttpStatus, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { StorageService } from './storage.service';
import { UploadResponseDto, UploadFileDto } from './dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { User } from '@prisma/client';

const MAX_FILE_SIZE = process.env.MAX_FILE_SIZE_BYTES
    ? parseInt(process.env.MAX_FILE_SIZE_BYTES, 10)
    : 20 * 1024 * 1024; // Default 20MB

@Controller('storage')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.DEVELOPER)
export class StorageController {
    constructor(private readonly storageService: StorageService) { }

    @Post('upload/profile')
    @UseInterceptors(FileInterceptor('file'))
    async uploadProfile(
        @UploadedFile(
            new ParseFilePipeBuilder()
                .addFileTypeValidator({
                    fileType: /(jpg|jpeg|png|webp)$/,
                })
                .addMaxSizeValidator({
                    maxSize: MAX_FILE_SIZE,
                })
                .build({
                    errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
                }),
        )
        file: Express.Multer.File,
        @Body() dto: UploadFileDto,
        @CurrentUser() user: User,
    ): Promise<UploadResponseDto> {
        return this.storageService.uploadProfileImage(file, user.id);
    }

    @Post('upload/image')
    @UseInterceptors(FileInterceptor('file'))
    async uploadImage(
        @UploadedFile(
            new ParseFilePipeBuilder()
                .addFileTypeValidator({
                    fileType: /(jpg|jpeg|png|webp|gif|svg)$/,
                })
                .addMaxSizeValidator({
                    maxSize: MAX_FILE_SIZE,
                })
                .build({
                    errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
                }),
        )
        file: Express.Multer.File,
        @Body() dto: UploadFileDto,
        @CurrentUser() user: User,
    ): Promise<UploadResponseDto> {
        return this.storageService.uploadImage(file, user.id);
    }

    @Post('upload/asset')
    @UseInterceptors(FileInterceptor('file'))
    async uploadAsset(
        @UploadedFile(
            new ParseFilePipeBuilder()
                .addMaxSizeValidator({
                    maxSize: MAX_FILE_SIZE,
                })
                .build({
                    errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
                }),
        )
        file: Express.Multer.File,
        @Body() dto: UploadFileDto,
        @CurrentUser() user: User,
    ): Promise<UploadResponseDto> {
        return this.storageService.uploadAsset(file, user.id);
    }
}
