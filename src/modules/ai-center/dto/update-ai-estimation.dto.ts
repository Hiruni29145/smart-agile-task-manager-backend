import { PartialType } from '@nestjs/mapped-types';
import { CreateAiEstimationDto } from './create-ai-estimation.dto';

export class UpdateAiEstimationDto extends PartialType(CreateAiEstimationDto) {}
