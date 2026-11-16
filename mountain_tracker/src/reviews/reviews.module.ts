import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './entities/review.entity.js';
import { Mountain } from '../mountains/entities/mountain.entity.js';
import { ReviewsService } from './reviews.service.js';
import { ReviewsController } from './reviews.controller.js';
import { AuthModule } from '../auth/auth.module.js';

// (#52)
@Module({
  imports: [TypeOrmModule.forFeature([Review, Mountain]), AuthModule],
  controllers: [ReviewsController],
  providers: [ReviewsService],
})
export class ReviewsModule {}
