import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { MountainsService } from './mountains.service.js';
import { Mountain } from './entities/mountain.entity.js';

// (#57)
describe('MountainsService', () => {
  let service: MountainsService;
  let mockRepo: {
    find: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
    remove: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    mockRepo = {
      find: vi.fn().mockResolvedValue([]),
      findOne: vi.fn().mockResolvedValue(null),
      create: vi.fn((dto) => ({ id: 1, ...dto })),
      save: vi.fn(async (entity) => entity),
      remove: vi.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MountainsService,
        {
          provide: getRepositoryToken(Mountain),
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<MountainsService>(MountainsService);
  });

  // (#57)
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // (#57)
  it('returns all mountains when search query is empty or whitespace', async () => {
    await service.search('   ');
    expect(mockRepo.find).toHaveBeenCalledWith({ order: { createdAt: 'DESC' } });
  });

  // (#57)
  it('throws NotFoundException when mountain does not exist', async () => {
    await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    await expect(service.remove(999)).rejects.toThrow(NotFoundException);
  });
});
