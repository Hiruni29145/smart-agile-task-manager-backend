import { Module } from '@nestjs/common';
import { AiCenterService } from './ai-center.service';
import { AiCenterController } from './ai-center.controller';

@Module({
  controllers: [AiCenterController],
  providers: [AiCenterService]
})
export class AiCenterModule {}
