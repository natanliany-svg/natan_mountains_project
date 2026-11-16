import { Test, TestingModule } from '@nestjs/testing';
import { TrailsController } from './trails.controller.js';
import { TrailsService } from './trails.service.js';

// (#60)
describe('TrailsController', () => {
  let controller: TrailsController;
  let mockService: {
    findByMountain: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    remove: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    mockService = {
      findByMountain: vi.fn().mockResolvedValue([]),
      create: vi.fn().mockResolvedValue({ id: 1 }),
      update: vi.fn().mockResolvedValue({ id: 1 }),
      remove: vi.fn().mockResolvedValue({ message: 'Trail deleted successfully' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TrailsController],
      providers: [
        {
          provide: TrailsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<TrailsController>(TrailsController);
  });

  // (#60)
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // (#60)
  it('delegates trail operations to TrailsService', async () => {
    await controller.findByMountain(1);
    expect(mockService.findByMountain).toHaveBeenCalledWith(1);

    await controller.create(1, {
      name: 'Summit Loop',
      length: 4.5,
      estimatedTime: 90,
      difficultyLevel: 3,
      isCircular: true,
    });
    expect(mockService.create).toHaveBeenCalledOnce();

    await controller.update(10, { isCircular: false });
    expect(mockService.update).toHaveBeenCalledWith(10, { isCircular: false });

    await controller.remove(10);
    expect(mockService.remove).toHaveBeenCalledWith(10);
  });
});
