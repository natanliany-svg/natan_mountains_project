import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AuthController } from '../src/auth/auth.controller.js';
import { AuthService } from '../src/auth/auth.service.js';
import { User, UserRole } from '../src/auth/entities/user.entity.js';
import { JwtStrategy } from '../src/auth/strategies/jwt.strategy.js';
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard.js';
import { AdminGuard } from '../src/auth/guards/admin.guard.js';
import { MountainsController } from '../src/mountains/mountains.controller.js';
import { MountainsService } from '../src/mountains/mountains.service.js';
import { Mountain } from '../src/mountains/entities/mountain.entity.js';
import { TrailsController } from '../src/trails/trails.controller.js';
import { TrailsService } from '../src/trails/trails.service.js';
import { Trail } from '../src/trails/entities/trail.entity.js';
import { ReviewsController } from '../src/reviews/reviews.controller.js';
import { ReviewsService } from '../src/reviews/reviews.service.js';
import { Review } from '../src/reviews/entities/review.entity.js';

// (#63)
describe('MountainTracker API (e2e)', () => {
  let app: INestApplication<App>;
  let users: User[];
  let mountains: Mountain[];
  let trails: Trail[];
  let reviews: Review[];

  beforeEach(async () => {
    users = [];
    mountains = [
      {
        id: 1,
        name: 'Mount Hermon',
        height: 2236,
        location: 'Golan Heights',
        difficultyLevel: 4,
        description: 'Highest peak',
        imageUrl: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    trails = [];
    reviews = [];

    const userRepo = {
      findOne: vi.fn(async ({ where }: { where: { email?: string; id?: number } }) =>
        users.find((u) => (where.email ? u.email === where.email : u.id === where.id)) ?? null,
      ),
      create: vi.fn((dto: Partial<User>) => ({
        id: users.length + 1,
        role: dto.email?.startsWith('admin@') ? UserRole.ADMIN : UserRole.USER,
        createdAt: new Date(),
        ...dto,
      } as User)),
      save: vi.fn(async (u: User) => {
        users.push(u);
        return u;
      }),
    };

    const mountainRepo = {
      find: vi.fn(async () => mountains),
      findOne: vi.fn(async ({ where }: { where: { id: number } }) =>
        mountains.find((m) => m.id === where.id) ?? null,
      ),
      create: vi.fn((dto: Partial<Mountain>) => ({
        id: mountains.length + 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...dto,
      } as Mountain)),
      save: vi.fn(async (m: Mountain) => {
        const idx = mountains.findIndex((item) => item.id === m.id);
        if (idx >= 0) mountains[idx] = m;
        else mountains.push(m);
        return m;
      }),
      remove: vi.fn(async (m: Mountain) => {
        mountains = mountains.filter((item) => item.id !== m.id);
      }),
    };

    const trailRepo = {
      find: vi.fn(async ({ where }: { where: { mountainId: number } }) =>
        trails.filter((t) => t.mountainId === where.mountainId),
      ),
      findOne: vi.fn(async ({ where }: { where: { id: number } }) =>
        trails.find((t) => t.id === where.id) ?? null,
      ),
      create: vi.fn((dto: Partial<Trail>) => ({
        id: trails.length + 1,
        ...dto,
      } as Trail)),
      save: vi.fn(async (t: Trail) => {
        const idx = trails.findIndex((item) => item.id === t.id);
        if (idx >= 0) trails[idx] = t;
        else trails.push(t);
        return t;
      }),
      remove: vi.fn(async (t: Trail) => {
        trails = trails.filter((item) => item.id !== t.id);
      }),
    };

    const reviewRepo = {
      find: vi.fn(async ({ where }: { where: { mountainId: number } }) =>
        reviews.filter((r) => r.mountainId === where.mountainId),
      ),
      findOne: vi.fn(async ({ where }: { where: { id: number } }) =>
        reviews.find((r) => r.id === where.id) ?? null,
      ),
      create: vi.fn((dto: Partial<Review>) => ({
        id: reviews.length + 1,
        createdAt: new Date(),
        ...dto,
      } as Review)),
      save: vi.fn(async (r: Review) => {
        reviews.push(r);
        return r;
      }),
      remove: vi.fn(async (r: Review) => {
        reviews = reviews.filter((item) => item.id !== r.id);
      }),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        PassportModule,
        JwtModule.register({
          secret: process.env.JWT_SECRET ?? 'secretKey',
          signOptions: { expiresIn: '1d' },
        }),
      ],
      controllers: [
        AuthController,
        MountainsController,
        TrailsController,
        ReviewsController,
      ],
      providers: [
        AuthService,
        MountainsService,
        TrailsService,
        ReviewsService,
        JwtStrategy,
        JwtAuthGuard,
        AdminGuard,
        { provide: getRepositoryToken(User), useValue: userRepo },
        { provide: getRepositoryToken(Mountain), useValue: mountainRepo },
        { provide: getRepositoryToken(Trail), useValue: trailRepo },
        { provide: getRepositoryToken(Review), useValue: reviewRepo },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  // (#63)
  it('GET /mountains and GET /mountains/search require JWT and resolve properly before :id', async () => {
    await request(app.getHttpServer()).get('/mountains').expect(401);
    await request(app.getHttpServer()).get('/mountains/search?q=Hermon').expect(401);
    await request(app.getHttpServer()).get('/mountains/1').expect(401);

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test@mountain.com',
        password: 'Password123',
        firstName: 'Test',
        lastName: 'User',
      })
      .expect(201);

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@mountain.com', password: 'Password123' })
      .expect(201);
    const token = loginRes.body.access_token as string;

    const listRes = await request(app.getHttpServer())
      .get('/mountains')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(listRes.body).toHaveLength(1);

    const searchRes = await request(app.getHttpServer())
      .get('/mountains/search?q=Hermon')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(searchRes.body).toHaveLength(1);

    await request(app.getHttpServer())
      .get('/mountains/not-a-number')
      .set('Authorization', `Bearer ${token}`)
      .expect(400);
  });

  // (#63)
  it('validates registration, logs in, enforces AdminGuard on mountains, and enforces author/admin on reviews', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'bad-email', password: '123' })
      .expect(400);

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'hiker@mountain.com',
        password: 'Password123',
        firstName: 'Hiker',
        lastName: 'One',
      })
      .expect(201);

    const hikerLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'hiker@mountain.com', password: 'Password123' })
      .expect(201);
    const hikerToken = hikerLogin.body.access_token as string;

    await request(app.getHttpServer())
      .post('/auth/refresh')
      .set('Authorization', `Bearer ${hikerToken}`)
      .expect(201);

    await request(app.getHttpServer())
      .post('/mountains')
      .set('Authorization', `Bearer ${hikerToken}`)
      .send({
        name: 'Mount Tabor',
        height: 588,
        location: 'Galilee',
        difficultyLevel: 2,
      })
      .expect(403);

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'admin@mountain.com',
        password: 'Password123',
        firstName: 'Admin',
        lastName: 'User',
      })
      .expect(201);

    const adminLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@mountain.com', password: 'Password123' })
      .expect(201);
    const adminToken = adminLogin.body.access_token as string;

    await request(app.getHttpServer())
      .post('/mountains')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Mount Tabor',
        height: 588,
        location: 'Galilee',
        difficultyLevel: 2,
      })
      .expect(201);

    await request(app.getHttpServer())
      .post('/mountains/1/trails')
      .set('Authorization', `Bearer ${hikerToken}`)
      .send({
        name: 'Summit Trail',
        length: 5.5,
        estimatedTime: 120,
        difficultyLevel: 3,
        isCircular: true,
      })
      .expect(201);

    await request(app.getHttpServer())
      .get('/mountains/1/trails')
      .expect(401);

    await request(app.getHttpServer())
      .get('/mountains/1/trails')
      .set('Authorization', `Bearer ${hikerToken}`)
      .expect(200);

    await request(app.getHttpServer())
      .delete('/trails/1')
      .set('Authorization', `Bearer ${hikerToken}`)
      .expect(403);

    await request(app.getHttpServer())
      .delete('/trails/1')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    const reviewRes = await request(app.getHttpServer())
      .post('/mountains/1/reviews')
      .set('Authorization', `Bearer ${hikerToken}`)
      .send({ rating: 5, comment: 'Wonderful hike!' })
      .expect(201);

    await request(app.getHttpServer())
      .delete(`/reviews/${reviewRes.body.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
  });
});
