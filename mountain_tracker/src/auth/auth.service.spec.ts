import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { AuthService } from './auth.service.js';
import { User, UserRole } from './entities/user.entity.js';

// (#55)
describe('AuthService', () => {
  let service: AuthService;
  let mockRepo: {
    findOne: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
  };
  let mockJwt: { signAsync: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    mockRepo = {
      findOne: vi.fn().mockResolvedValue(null),
      create: vi.fn((dto) => ({ id: 1, role: UserRole.USER, ...dto })),
      save: vi.fn(async (user) => user),
    };
    mockJwt = {
      signAsync: vi.fn().mockResolvedValue('mock-jwt-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepo,
        },
        {
          provide: JwtService,
          useValue: mockJwt,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  // (#55)
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // (#55)
  it('registers a new user and strips the password', async () => {
    const res = await service.register({
      email: 'test@mountain.com',
      password: 'Password123',
      firstName: 'Test',
      lastName: 'User',
    });
    expect(res.user.email).toBe('test@mountain.com');
    expect((res.user as Record<string, unknown>).password).toBeUndefined();
  });

  // (#55)
  it('throws ConflictException if email already exists', async () => {
    mockRepo.findOne.mockResolvedValueOnce({ id: 1, email: 'test@mountain.com' });
    await expect(
      service.register({
        email: 'test@mountain.com',
        password: 'Password123',
        firstName: 'Test',
        lastName: 'User',
      }),
    ).rejects.toThrow(ConflictException);
  });

  // (#55)
  it('logs in a valid user and returns an access token', async () => {
    const hashedPassword = await bcrypt.hash('Password123', 4);
    mockRepo.findOne.mockResolvedValueOnce({
      id: 5,
      email: 'test@mountain.com',
      password: hashedPassword,
      firstName: 'Test',
      lastName: 'User',
      role: UserRole.USER,
    });

    const res = await service.login({
      email: 'test@mountain.com',
      password: 'Password123',
    });
    expect(res.access_token).toBe('mock-jwt-token');
    expect(mockJwt.signAsync).toHaveBeenCalledWith({
      sub: 5,
      email: 'test@mountain.com',
      role: UserRole.USER,
    });
  });

  // (#55)
  it('throws UnauthorizedException for invalid password or missing user', async () => {
    await expect(
      service.login({ email: 'missing@mountain.com', password: '123' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  // (#55)
  it('refreshes token for authenticated user', async () => {
    const res = await service.refresh({
      userId: 7,
      email: 'admin@mountain.com',
      role: UserRole.ADMIN,
    });
    expect(res.access_token).toBe('mock-jwt-token');
    expect(mockJwt.signAsync).toHaveBeenCalledWith({
      sub: 7,
      email: 'admin@mountain.com',
      role: UserRole.ADMIN,
    });
  });
});
