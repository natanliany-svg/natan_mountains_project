import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsController } from './reviews.controller.js';
import { ReviewsService } from './reviews.service.js';
import { UserRole } from '../auth/entities/user.entity.js';

// (#62)
describe('ReviewsController', () => {
  let controller: ReviewsController;
  let mockService: {
    findByMountain: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    remove: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    mockService = {
      findByMountain: vi.fn().mockResolvedValue([]),
      create: vi.fn().mockResolvedValue({ id: 1 }),
      remove: vi.fn().mockResolvedValue({ message: 'Review deleted successfully' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReviewsController],
      providers: [
        {
          provide: ReviewsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<ReviewsController>(ReviewsController);
  });

  // (#62)
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // (#62)
  it('delegates review operations to ReviewsService', async () => {
    await controller.findByMountain(1);
    expect(mockService.findByMountain).toHaveBeenCalledWith(1);

    await controller.create(
      1,
      { user: { userId: 5, email: 'u@b.com', role: UserRole.USER } },
      { rating: 5, comment: 'Great mountain!' },
    );
    expect(mockService.create).toHaveBeenCalledWith(1, 5, {
      rating: 5,
      comment: 'Great mountain!',
    });

    await controller.remove(7, {
      user: { userId: 5, email: 'u@b.com', role: UserRole.USER },
    });
    expect(mockService.remove).toHaveBeenCalledWith(7, {
      userId: 5,
      email: 'u@b.com',
      role: UserRole.USER,
    });
  });
});
