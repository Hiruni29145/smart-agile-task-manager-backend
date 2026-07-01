import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '@prisma/client';
import { UploadResponseDto } from './dto/response';
import { Messages } from '../../common/constants';

@Injectable()
export class StorageService {
    private readonly logger = new Logger(StorageService.name);
    private supabase: SupabaseClient;
    private bucket: string;

    constructor(
        private readonly configService: ConfigService,
        private readonly notificationsService: NotificationsService,
    ) {
        const url = this.configService.get<string>('supabase.url');
        const key = this.configService.get<string>('supabase.serviceRoleKey');
        this.bucket = this.configService.get<string>('supabase.storageBucket', 'avatars');

        if (!url || !key) {
            this.logger.error(Messages.STORAGE_CREDENTIALS_MISSING);
            throw new InternalServerErrorException(Messages.STORAGE_CONFIG_MISSING);
        }

        this.supabase = createClient(url, key);
    }

    async uploadProfileImage(file: Express.Multer.File, userId: string): Promise<UploadResponseDto> {
        const url = await this.uploadFile(file, 'profile', userId);

        await this.notificationsService.create(
            userId,
            'Profile Image Updated',
            Messages.STORAGE_UPLOAD_PROFILE_SUCCESS,
            NotificationType.SUCCESS,
        );

        return new UploadResponseDto({ url, path: 'profile' });
    }

    async uploadImage(file: Express.Multer.File, userId: string): Promise<UploadResponseDto> {
        const url = await this.uploadFile(file, 'image', userId);

        await this.notificationsService.create(
            userId,
            'Image Uploaded',
            Messages.STORAGE_UPLOAD_IMAGE_SUCCESS,
            NotificationType.SUCCESS,
        );

        return new UploadResponseDto({ url, path: 'image' });
    }

    async uploadAsset(file: Express.Multer.File, userId: string): Promise<UploadResponseDto> {
        const url = await this.uploadFile(file, 'asset', userId);

        await this.notificationsService.create(
            userId,
            'Asset Uploaded',
            Messages.STORAGE_UPLOAD_ASSET_SUCCESS,
            NotificationType.SUCCESS,
        );

        return new UploadResponseDto({ url, path: 'asset' });
    }

    private async uploadFile(file: Express.Multer.File, folder: string, userId: string): Promise<string> {
        if (!file) {
            throw new BadRequestException(Messages.STORAGE_NO_FILE);
        }

        const fileExt = extname(file.originalname);
        const fileName = `${folder}/${uuidv4()}${fileExt}`;

        try {
            const { data, error } = await this.supabase.storage
                .from(this.bucket)
                .upload(fileName, file.buffer, {
                    contentType: file.mimetype,
                    upsert: false,
                });

            if (error) {
                this.logger.error(`Upload failed: ${error.message}`);
                throw new InternalServerErrorException(`${Messages.STORAGE_UPLOAD_FAILED}: ${error.message}`);
            }

            const { data: { publicUrl } } = this.supabase.storage
                .from(this.bucket)
                .getPublicUrl(fileName);

            this.logger.log(`File uploaded: ${publicUrl}`);
            return publicUrl;
        } catch (error) {
            if (error instanceof InternalServerErrorException || error instanceof BadRequestException) {
                throw error;
            }
            this.logger.error(`Storage error: ${error instanceof Error ? error.message : 'Unknown'}`);
            throw new InternalServerErrorException(Messages.STORAGE_UPLOAD_FAILED);
        }
    }
}
