import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { MountainsService } from './mountains.service.js';
import { CreateMountainDto, UpdateMountainDto } from '../entities.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { AdminGuard } from '../auth/guards/admin.guard.js';

// (#36)
@ApiTags('mountains')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('mountains')
export class MountainsController {
  // (#36)
  constructor(private readonly mountainsService: MountainsService) {}

  // (#36)
  @Get()
  async findAll() {
    return await this.mountainsService.findAll();
  }

  // (#36)
  @Get('search')
  async search(@Query('q') q?: string) {
    return await this.mountainsService.search(q);
  }

  // (#36)
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.mountainsService.findOne(id);
  }

  // (#37)
  @UseGuards(AdminGuard)
  @Post()
  async create(@Body() createMountainDto: CreateMountainDto) {
    return await this.mountainsService.create(createMountainDto);
  }

  // (#37)
  @UseGuards(AdminGuard)
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMountainDto: UpdateMountainDto,
  ) {
    return await this.mountainsService.update(id, updateMountainDto);
  }

  // (#37)
  @UseGuards(AdminGuard)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.mountainsService.remove(id);
  }
}
