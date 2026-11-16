import { Test, TestingModule } from '@nestjs/testing';
import { MountainsController } from './mountains.controller.js';
import { MountainsService } from './mountains.service.js';

// (#58)
describe('MountainsController', () => {
  let controller: MountainsController;
  let mockService: {
    findAll: ReturnType<typeof vi.fn>;
    search: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    remove: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    mockService = {
      findAll: vi.fn().mockResolvedValue([{ id: 1, name: 'Hermon' }]),
      search: vi.fn().mockResolvedValue([{ id: 1, name: 'Hermon' }]),
      findOne: vi.fn().mockResolvedValue({ id: 1, name: 'Hermon' }),
      create: vi.fn().mockResolvedValue({ id: 2, name: 'Tabor' }),
      update: vi.fn().mockResolvedValue({ id: 1, name: 'Hermon Updated' }),
      remove: vi.fn().mockResolvedValue({ message: 'Mountain deleted successfully' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MountainsController],
      providers: [
        {
          provide: MountainsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<MountainsController>(MountainsController);
  });

  // (#58)
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // (#58)
  it('delegates CRUD and search operations to MountainsService', async () => {
    await controller.findAll();
    expect(mockService.findAll).toHaveBeenCalledOnce();

    await controller.search('Hermon');
    expect(mockService.search).toHaveBeenCalledWith('Hermon');

    await controller.findOne(1);
    expect(mockService.findOne).toHaveBeenCalledWith(1);

    await controller.create({
      name: 'Tabor',
      height: 588,
      location: 'Lower Galilee',
      difficultyLevel: 2,
    });
    expect(mockService.create).toHaveBeenCalledOnce();

    await controller.update(1, { height: 2236 });
    expect(mockService.update).toHaveBeenCalledWith(1, { height: 2236 });

    await controller.remove(1);
    expect(mockService.remove).toHaveBeenCalledWith(1);
  });
});
