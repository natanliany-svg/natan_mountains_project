import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TrailsService } from './trails.service.js';
import { CreateTrailDto, UpdateTrailDto } from '../entities.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { AdminGuard } from '../auth/guards/admin.guard.js';

// (#44)
@ApiTags('trails')
@Controller()
export class TrailsController {
  // (#44)
  constructor(private readonly trailsService: TrailsService) {}

  // (#44)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('mountains/:mountainId/trails')
  async findByMountain(@Param('mountainId', ParseIntPipe) mountainId: number) {
    return await this.trailsService.findByMountain(mountainId);
  }

  // (#44)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('mountains/:mountainId/trails')
  async create(
    @Param('mountainId', ParseIntPipe) mountainId: number,
    @Body() createTrailDto: CreateTrailDto,
  ) {
    return await this.trailsService.create(mountainId, createTrailDto);
  }

  // (#44)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put('trails/:id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTrailDto: UpdateTrailDto,
  ) {
    return await this.trailsService.update(id, updateTrailDto);
  }

  // (#44)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete('trails/:id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.trailsService.remove(id);
  }
}
