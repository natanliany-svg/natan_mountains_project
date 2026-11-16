import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { UserRole } from './entities/user.entity.js';

// (#56)
describe('AuthController', () => {
  let controller: AuthController;
  let mockService: {
    register: ReturnType<typeof vi.fn>;
    login: ReturnType<typeof vi.fn>;
    refresh: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    mockService = {
      register: vi.fn().mockResolvedValue({ message: 'User registered successfully' }),
      login: vi.fn().mockResolvedValue({ access_token: 'jwt-token' }),
      refresh: vi.fn().mockResolvedValue({ access_token: 'refreshed-jwt-token' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  // (#56)
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // (#56)
  it('delegates register, login, and refresh to AuthService', async () => {
    await controller.register({
      email: 'a@b.com',
      password: '123456',
      firstName: 'A',
      lastName: 'B',
    });
    expect(mockService.register).toHaveBeenCalledOnce();

    await controller.login({ email: 'a@b.com', password: '123456' });
    expect(mockService.login).toHaveBeenCalledOnce();

    await controller.refresh({
      user: { userId: 1, email: 'a@b.com', role: UserRole.USER },
    });
    expect(mockService.refresh).toHaveBeenCalledWith({
      userId: 1,
      email: 'a@b.com',
      role: UserRole.USER,
    });
  });
});
