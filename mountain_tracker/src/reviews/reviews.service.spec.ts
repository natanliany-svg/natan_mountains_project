import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ReviewsService } from './reviews.service.js';
import { Review } from './entities/review.entity.js';
import { Mountain } from '../mountains/entities/mountain.entity.js';
import { UserRole } from '../auth/entities/user.entity.js';

// (#61)
describe('ReviewsService', () => {
  let service: ReviewsService;
  let mockReviewRepo: {
    find: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
    remove: ReturnType<typeof vi.fn>;
  };
  let mockMountainRepo: {
    findOne: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    mockReviewRepo = {
      find: vi.fn().mockResolvedValue([]),
      findOne: vi.fn().mockResolvedValue(null),
      create: vi.fn((dto) => ({ id: 1, ...dto })),
      save: vi.fn(async (entity) => entity),
      remove: vi.fn().mockResolvedValue(undefined),
    };
    mockMountainRepo = {
      findOne: vi.fn().mockResolvedValue({ id: 1 }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsService,
        {
          provide: getRepositoryToken(Review),
          useValue: mockReviewRepo,
        },
        {
          provide: getRepositoryToken(Mountain),
          useValue: mockMountainRepo,
        },
      ],
    }).compile();

    service = module.get<ReviewsService>(ReviewsService);
  });

  // (#61)
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // (#61)
  it('allows review author to delete their own review', async () => {
    mockReviewRepo.findOne.mockResolvedValueOnce({ id: 10, userId: 42 });
    const res = await service.remove(10, {
      userId: 42,
      email: 'author@mountain.com',
      role: UserRole.USER,
    });
    expect(res.message).toBe('Review deleted successfully');
  });

  // (#61)
  it('allows admin to delete any user review', async () => {
    mockReviewRepo.findOne.mockResolvedValueOnce({ id: 10, userId: 42 });
    const res = await service.remove(10, {
      userId: 1,
      email: 'admin@mountain.com',
      role: UserRole.ADMIN,
    });
    expect(res.message).toBe('Review deleted successfully');
  });

  // (#61)
  it('forbids non-owner regular user from deleting someone else review', async () => {
    mockReviewRepo.findOne.mockResolvedValueOnce({ id: 10, userId: 42 });
    await expect(
      service.remove(10, {
        userId: 99,
        email: 'other@mountain.com',
        role: UserRole.USER,
      }),
    ).rejects.toThrow(ForbiddenException);
  });

  // (#61)
  it('throws NotFoundException when review does not exist', async () => {
    await expect(
      service.remove(999, {
        userId: 1,
        email: 'admin@mountain.com',
        role: UserRole.ADMIN,
      }),
    ).rejects.toThrow(NotFoundException);
  });
});
