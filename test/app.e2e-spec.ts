import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import request from 'supertest';
import type { App } from 'supertest/types';
import type { FindManyOptions, FindOneOptions } from 'typeorm';
import { AuthModule } from '../src/auth/auth.module';
import type { JwtPayload } from '../src/auth/interfaces/jwt-payload.interface';
import { Reservation } from '../src/reservations/entities/reservation.entity';
import { ReservationsModule } from '../src/reservations/reservations.module';
import { Room } from '../src/rooms/room.entity';
import { RoomsModule } from '../src/rooms/rooms.module';
import { User } from '../src/users/entities/user.entity';
import { createMockRoom } from './factories/room.factory';
import { createMockUser } from './factories/user.factory';

function getAccessToken(body: unknown): string {
  if (
    typeof body !== 'object' ||
    body === null ||
    !('accessToken' in body) ||
    typeof body.accessToken !== 'string'
  ) {
    throw new Error('Expected a login response containing an accessToken');
  }
  return body.accessToken;
}

describe('Roomly HTTP integration (repository doubles)', () => {
  let app: INestApplication<App>;
  let jwtService: JwtService;
  let token: string;
  const password = 'test-password';
  const frontendUrl = 'http://roomly.test';
  const user = createMockUser({
    id: 'd2d8b9a2-18f9-4a81-a77d-9b4a97c33a12',
  });
  const room = createMockRoom({
    id: '673cc3d9-6c37-407b-8f81-4aa88aeaf214',
    createdAt: new Date('2026-01-01T00:00:00Z'),
  });
  const payload: JwtPayload = {
    sub: user.id,
    email: user.email,
    role: user.role,
  };
  const usersRepository = {
    findOne: jest.fn<Promise<User | null>, [FindOneOptions<User>]>(),
  };
  const roomQuery = {
    andWhere: jest.fn().mockReturnThis(),
    getMany: jest.fn<Promise<Room[]>, []>(),
  };
  const roomsRepository = { createQueryBuilder: jest.fn(() => roomQuery) };
  const reservationsRepository = {
    find: jest.fn<Promise<Reservation[]>, [FindManyOptions<Reservation>]>(),
  };

  beforeAll(async () => {
    user.password = await bcrypt.hash(password, 10);

    // Never import AppModule: its TypeORM root connects to the configured DB.
    // Real feature modules run against doubles for every repository instead.
    const moduleFixture = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          ignoreEnvFile: true,
          skipProcessEnv: true,
          load: [
            () => ({
              JWT_SECRET: 'http-integration-test-only-secret',
              JWT_EXPIRES_IN: '1h',
              FRONTEND_URL: frontendUrl,
            }),
          ],
        }),
        AuthModule,
        RoomsModule,
        ReservationsModule,
      ],
    })
      .overrideProvider(getRepositoryToken(User))
      .useValue(usersRepository)
      .overrideProvider(getRepositoryToken(Room))
      .useValue(roomsRepository)
      .overrideProvider(getRepositoryToken(Reservation))
      .useValue(reservationsRepository)
      .compile();

    app = moduleFixture.createNestApplication();
    // Mirror main.ts without invoking its bootstrap/listen or loading real env.
    const configService = app.get(ConfigService);
    app.enableCors({
      origin:
        configService.get<string>('FRONTEND_URL') ?? 'http://localhost:5173',
    });
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Roomly API')
      .setDescription('API for meeting room reservations')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT access token',
        },
        'JWT-auth',
      )
      .build();
    SwaggerModule.setup(
      'api/docs',
      app,
      SwaggerModule.createDocument(app, swaggerConfig),
    );
    await app.init();
    jwtService = app.get(JwtService);
    token = jwtService.sign(payload);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    usersRepository.findOne.mockResolvedValue(user);
    roomQuery.getMany.mockResolvedValue([room]);
    reservationsRepository.find.mockResolvedValue([]);
  });

  afterAll(async () => {
    await app?.close();
  });

  it.each(['/', '/rooms'])(
    'returns 404 for obsolete/unprefixed route %s',
    (path) => request(app.getHttpServer()).get(path).expect(404),
  );

  it('serves public rooms under /api', () =>
    request(app.getHttpServer())
      .get('/api/rooms')
      .expect(200)
      .expect([{ ...room, createdAt: room.createdAt.toISOString() }]));

  it('signs a real login token and exposes only the JWT identity in /users/me', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: user.email, password })
      .expect(201);
    const body: unknown = response.body;
    const accessToken = getAccessToken(body);
    expect(body).toEqual({ accessToken });
    expect(jwtService.verify<JwtPayload>(accessToken)).toMatchObject(payload);
    expect(usersRepository.findOne).toHaveBeenCalledWith({
      where: { email: user.email },
    });
    await request(app.getHttpServer())
      .get('/api/users/me')
      .auth(accessToken, { type: 'bearer' })
      .expect(200)
      .expect({ userId: user.id, email: user.email, role: user.role });
  });

  it.each([
    ['ASCII', 'a'.repeat(73)],
    ['multibyte UTF-8', 'é'.repeat(37)],
  ])(
    'rejects an over-limit %s registration password before database access',
    async (_label, password) => {
      await request(app.getHttpServer())
        .post('/api/users')
        .send({
          email: user.email,
          firstName: 'Test',
          lastName: 'User',
          password,
        })
        .expect(400)
        .expect({
          statusCode: 400,
          error: 'Bad Request',
          message: ['password must not exceed 72 bytes in UTF-8'],
        });
      expect(usersRepository.findOne).not.toHaveBeenCalled();
    },
  );

  it('rejects an incorrect password through the real authentication service', () =>
    request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: user.email, password: 'incorrect-password' })
      .expect(401)
      .expect({
        statusCode: 401,
        message: 'Invalid credentials',
        error: 'Unauthorized',
      }));

  it.each(['', 'Bearer invalid-token'])(
    'rejects missing/invalid JWT: %s',
    (authorization) =>
      request(app.getHttpServer())
        .get('/api/users/me')
        .set('Authorization', authorization)
        .expect(401),
  );

  it('passes the JWT user ID to the personal reservations query', async () => {
    await request(app.getHttpServer())
      .get('/api/reservations/me')
      .auth(token, { type: 'bearer' })
      .expect(200)
      .expect([]);
    expect(reservationsRepository.find).toHaveBeenCalledWith({
      where: { user: { id: user.id } },
      order: { startTime: 'ASC' },
    });
  });

  it('transforms numeric query input before the real rooms service runs', async () => {
    await request(app.getHttpServer())
      .get('/api/rooms?capacity=8&hasProjector=false')
      .expect(200);
    expect(roomQuery.andWhere).toHaveBeenCalledWith(
      'room.capacity >= :capacity',
      {
        capacity: 8,
      },
    );
    expect(roomQuery.andWhere).toHaveBeenCalledWith(
      'room.hasProjector = :hasProjector',
      { hasProjector: false },
    );
  });

  it('rejects invalid query values before reaching the repository', async () => {
    await request(app.getHttpServer())
      .get('/api/rooms?capacity=invalid&hasProjector=1')
      .expect(400);
    expect(roomsRepository.createQueryBuilder).not.toHaveBeenCalled();
  });

  it('rejects non-whitelisted body properties before reaching the service', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: user.email, password, unexpected: true })
      .expect(400)
      .expect({
        statusCode: 400,
        message: ['property unexpected should not exist'],
        error: 'Bad Request',
      });
    expect(usersRepository.findOne).not.toHaveBeenCalled();
  });

  it('uses the configured frontend origin for CORS preflight', () =>
    request(app.getHttpServer())
      .options('/api/rooms')
      .set('Origin', frontendUrl)
      .set('Access-Control-Request-Method', 'GET')
      .expect(204)
      .expect('Access-Control-Allow-Origin', frontendUrl));

  it('serves Swagger UI at the configured path', () =>
    request(app.getHttpServer())
      .get('/api/docs')
      .expect(200)
      .expect('Content-Type', /html/)
      .expect(/Swagger UI/));

  it('serves OpenAPI with the configured prefix and bearer scheme', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/docs-json')
      .expect(200);
    const document: unknown = response.body;
    expect(document).toMatchObject({
      info: { title: 'Roomly API', version: '1.0' },
      paths: {
        '/api/users/me': { get: { security: [{ 'JWT-auth': [] }] } },
        '/api/rooms': {
          get: {
            responses: {
              '200': {
                content: {
                  'application/json': {
                    schema: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/RoomResponseDto' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      components: {
        securitySchemes: {
          'JWT-auth': { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        },
      },
    });
  });
});
