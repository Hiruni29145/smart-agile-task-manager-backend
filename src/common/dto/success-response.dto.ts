import { Expose } from 'class-transformer';

/**
 * Common success response DTO for message-only APIs.
 * Use this when the API doesn't return data, only a success message.
 * 
 * @example
 * // In service:
 * return new SuccessResponseDto({ message: 'Operation successful' });
 * 
 * // In controller:
 * return this.authService.forgotPassword(email);
 */
export class SuccessResponseDto {
    @Expose()
    message!: string;

    constructor(partial: Partial<SuccessResponseDto>) {
        Object.assign(this, partial);
    }
}
