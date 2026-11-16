import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity.js';
import { Mountain } from '../mountains/entities/mountain.entity.js';
import { CreateReviewDto } from '../entities.dto.js';
import { AuthenticatedUser } from '../auth/strategies/jwt.strategy.js';
import { UserRole } from '../auth/entities/user.entity.js';

// (#50)
@Injectable()
export class ReviewsService {
  // (#50)
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(Mountain)
    private readonly mountainRepository: Repository<Mountain>,
  ) {}

  // (#50)
  async findByMountain(mountainId: number): Promise<Review[]> {
    return await this.reviewRepository.find({
      where: { mountainId },
      relations: { user: true },
      select: {
        id: true,
        mountainId: true,
        userId: true,
        rating: true,
        comment: true,
        createdAt: true,
        user: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
      order: { createdAt: 'DESC' },
    });
  }

  // (#50)
  async create(
    mountainId: number,
    userId: number,
    createReviewDto: CreateReviewDto,
  ): Promise<Review> {
    const mountain = await this.mountainRepository.findOne({
      where: { id: mountainId },
    });
    if (!mountain) {
      throw new NotFoundException('Mountain not found');
    }

    const review = this.reviewRepository.create({
      mountainId,
      userId,
      rating: createReviewDto.rating,
      comment: createReviewDto.comment,
    });
    return await this.reviewRepository.save(review);
  }

  // (#50)
  async remove(
    id: number,
    user: AuthenticatedUser,
  ): Promise<{ message: string }> {
    const review = await this.reviewRepository.findOne({ where: { id } });
    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.userId !== user.userId && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('You can only delete your own reviews');
    }

    await this.reviewRepository.remove(review);
    return { message: 'Review deleted successfully' };
  }
}
