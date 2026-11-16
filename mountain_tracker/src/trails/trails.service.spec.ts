import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { TrailsService } from './trails.service.js';
import { Trail } from './entities/trail.entity.js';
import { Mountain } from '../mountains/entities/mountain.entity.js';

// (#59)
describe('TrailsService', () => {
  let service: TrailsService;
  let mockTrailRepo: {
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
    mockTrailRepo = {
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
        TrailsService,
        {
          provide: getRepositoryToken(Trail),
          useValue: mockTrailRepo,
        },
        {
          provide: getRepositoryToken(Mountain),
          useValue: mockMountainRepo,
        },
      ],
    }).compile();

    service = module.get<TrailsService>(TrailsService);
  });

  // (#59)
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // (#59)
  it('throws NotFoundException when creating trail for non-existent mountain', async () => {
    mockMountainRepo.findOne.mockResolvedValueOnce(null);
    await expect(
      service.create(999, {
        name: 'Summit Trail',
        length: 5,
        estimatedTime: 120,
        difficultyLevel: 3,
        isCircular: true,
      }),
    ).rejects.toThrow(NotFoundException);
  });

  // (#59)
  it('throws NotFoundException when updating or removing non-existent trail', async () => {
    await expect(service.update(999, { name: 'Updated' })).rejects.toThrow(
      NotFoundException,
    );
    await expect(service.remove(999)).rejects.toThrow(NotFoundException);
  });
});
