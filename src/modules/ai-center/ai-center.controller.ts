import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards, Query } from '@nestjs/common';
import { AiCenterService } from './ai-center.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { User } from '@prisma/client';
import { CreateAiEstimationDto, UpdateAiEstimationDto, AiEstimationResponseDto } from './dto';
import { PaginationDto, PaginatedResponse } from '../../common/dto/pagination.dto';

@Controller('ai-center')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class AiCenterController {
  constructor(private readonly aiCenterService: AiCenterService) {}

  @Post('estimations')
  async create(
    @CurrentUser() user: User,
    @Body() createDto: CreateAiEstimationDto,
  ): Promise<AiEstimationResponseDto> {
    return this.aiCenterService.createEstimation(user.id, createDto);
  }

  @Get('estimations')
  async findAll(
    @CurrentUser() user: User,
    @Query() query: PaginationDto,
  ): Promise<PaginatedResponse<AiEstimationResponseDto>> {
    return this.aiCenterService.getEstimations(user.id, query);
  }

  @Get('estimations/:id')
  async findOne(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<AiEstimationResponseDto> {
    return this.aiCenterService.getEstimationById(user.id, id);
  }

  @Put('estimations/:id')
  async update(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateAiEstimationDto,
  ): Promise<AiEstimationResponseDto> {
    return this.aiCenterService.updateEstimation(user.id, id, updateDto);
  }

  @Delete('estimations/:id')
  async remove(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    return this.aiCenterService.deleteEstimation(user.id, id);
  }
}
