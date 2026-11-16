import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service.js';
import { CreateReviewDto } from '../entities.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { AuthenticatedUser } from '../auth/strategies/jwt.strategy.js';

// (#51)
@ApiTags('reviews')
@Controller()
export class ReviewsController {
  // (#51)
  constructor(private readonly reviewsService: ReviewsService) {}

  // (#51)
  @Get('mountains/:mountainId/reviews')
  async findByMountain(@Param('mountainId', ParseIntPipe) mountainId: number) {
    return await this.reviewsService.findByMountain(mountainId);
  }

  // (#51)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('mountains/:mountainId/reviews')
  async create(
    @Param('mountainId', ParseIntPipe) mountainId: number,
    @Req() req: { user: AuthenticatedUser },
    @Body() createReviewDto: CreateReviewDto,
  ) {
    return await this.reviewsService.create(
      mountainId,
      req.user.userId,
      createReviewDto,
    );
  }

  // (#51)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('reviews/:id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: { user: AuthenticatedUser },
  ) {
    return await this.reviewsService.remove(id, req.user);
  }
}
