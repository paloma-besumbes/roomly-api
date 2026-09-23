import {
  ForbiddenException,
  INestApplication,
  NotFoundException,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { OpenAPIObject } from '@nestjs/swagger';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import type { App } from 'supertest/types';

import { createMockReservation } from '../test/factories/reservation.factory';
import { createMockRoom } from '../test/factories/room.factory';
import { createMockUser } from '../test/factories/user.factory';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { JwtStrategy } from './auth/strategies/jwt.strategy';
import { ReservationMapper } from './reservations/mappers/reservation.mapper';
import { ReservationsController } from './reservations/reservations.controller';
import { ReservationsService } from './reservations/reservations.service';
import { RoomsController } from './rooms/rooms.controller';
import { RoomsService } from './rooms/rooms.service';
import { User } from './users/entities/user.entity';
import { UserRole } from './users/entities/user-role.enum';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';

describe('Swagger response contracts', () => {
  let app: INestApplication<App>;
  let document: OpenAPIObject;
  let token: string;
  let adminToken: string;
  const secret = 'swagger-contract-test-secret';
  const mockRemoveReservation = jest.fn().mockResolvedValue(undefined);
  const user = createMockUser({
    id: '550e8400-e29b-41d4-a716-446655440001',
  });
  const room = createMockRoom({
    id: '550e8400-e29b-41d4-a716-446655440002',
  });
  const mockRoomsService = {
    findAll: jest.fn().mockResolvedValue([room]),
    create: jest.fn().mockResolvedValue(room),
  };
  const createRoomDto = {
    name: room.name,
    description: room.description,
    capacity: room.capacity,
    hasProjector: room.hasProjector,
    hasWhiteboard: room.hasWhiteboard,
  };
  const reservation = ReservationMapper.toResponseDto(
    createMockReservation({
      id: '550e8400-e29b-41d4-a716-446655440003',
      user,
      room,
    }),
  );

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [PassportModule, JwtModule.register({ secret })],
      controllers: [
        UsersController,
        AuthController,
        RoomsController,
        ReservationsController,
      ],
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: new ConfigService({ JWT_SECRET: secret }),
        },
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: { find: jest.fn().mockResolvedValue([user]) },
        },
        {
          provide: AuthService,
          useValue: {
            login: jest.fn().mockResolvedValue({ accessToken: 'test-token' }),
          },
        },
        {
          provide: RoomsService,
          useValue: mockRoomsService,
        },
        {
          provide: ReservationsService,
          useValue: {
            create: jest.fn().mockResolvedValue(reservation),
            findMyReservations: jest.fn().mockResolvedValue([reservation]),
            remove: mockRemoveReservation,
          },
        },
      ],
    }).compile();

    app = module.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
    // Match the named bearer scheme configured in main.ts.
    const config = new DocumentBuilder()
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        'JWT-auth',
      )
      .build();
    document = SwaggerModule.createDocument(app, config);
    token = await module.get(JwtService).signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
    adminToken = await module.get(JwtService).signAsync({
      sub: '550e8400-e29b-41d4-a716-446655440004',
      email: 'admin@example.com',
      role: UserRole.ADMIN,
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app?.close();
  });

  function schema(name: string) {
    const definition = document.components!.schemas![name];
    if ('$ref' in definition) {
      throw new Error(`Expected an inline schema for ${name}`);
    }
    return definition;
  }

  function responseSchema(
    path: string,
    method: 'get' | 'post',
    status: number,
  ) {
    const response = document.paths[path][method]!.responses[status];
    if (!response || '$ref' in response) {
      throw new Error(`Expected an inline response for ${method} ${path}`);
    }
    return response.content!['application/json'].schema;
  }

  function expectFields(name: string, body: object) {
    expect(Object.keys(schema(name).properties!).sort()).toEqual(
      Object.keys(body).sort(),
    );
    expect([...schema(name).required!].sort()).toEqual(
      Object.keys(body).sort(),
    );
  }

  it('uses the registered bearer scheme only on protected operations', () => {
    expect(document.components!.securitySchemes!['JWT-auth']).toMatchObject({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    });
    for (const [path, method] of [
      ['/api/users/me', 'get'],
      ['/api/users', 'get'],
      ['/api/rooms', 'post'],
      ['/api/reservations', 'post'],
      ['/api/reservations/me', 'get'],
      ['/api/reservations/{id}', 'delete'],
    ] as const) {
      expect(document.paths[path][method]!.security).toEqual([
        { 'JWT-auth': [] },
      ]);
      expect(document.paths[path][method]!.responses).toHaveProperty('401');
    }
    for (const [path, method] of [
      ['/api/users', 'post'],
      ['/api/auth/login', 'post'],
      ['/api/rooms', 'get'],
    ] as const) {
      expect(document.paths[path][method]!.security).toBeUndefined();
    }
  });

  it('documents the JWT identity actually returned by the profile route', async () => {
    const identity = { userId: user.id, email: user.email, role: user.role };
    await request(app.getHttpServer())
      .get('/api/users/me')
      .auth(token, { type: 'bearer' })
      .expect(200, identity);
    expect(responseSchema('/api/users/me', 'get', 200)).toEqual({
      $ref: '#/components/schemas/UserProfileResponseDto',
    });
    expectFields('UserProfileResponseDto', identity);
  });

  it('documents public user responses without password hashes', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/users')
      .auth(token, { type: 'bearer' })
      .expect(200);
    const users = response.body as Record<string, unknown>[];
    expect(users).toHaveLength(1);
    expect(users[0]).not.toHaveProperty('password');
    expectFields('UserResponseDto', users[0]);
    expect(responseSchema('/api/users', 'get', 200)).toEqual({
      type: 'array',
      items: { $ref: '#/components/schemas/UserResponseDto' },
    });
    expect(responseSchema('/api/users', 'post', 201)).toEqual({
      $ref: '#/components/schemas/UserResponseDto',
    });
  });

  it('documents the existing 201 login response and token body', async () => {
    const body = { accessToken: 'test-token' };
    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: user.email, password: 'secret123' })
      .expect(201, body);
    expect(
      document.paths['/api/auth/login'].post!.responses,
    ).not.toHaveProperty('200');
    expect(responseSchema('/api/auth/login', 'post', 201)).toEqual({
      $ref: '#/components/schemas/LoginResponseDto',
    });
    expectFields('LoginResponseDto', body);
  });

  describe.each(['hasProjector', 'hasWhiteboard'] as const)(
    'room query parameter %s',
    (filter) => {
      it('documents only true and false strings as optional values', () => {
        const parameter = document.paths['/api/rooms'].get!.parameters!.find(
          (entry) => !('$ref' in entry) && entry.name === filter,
        );
        expect(parameter).toMatchObject({
          name: filter,
          in: 'query',
          required: false,
          schema: { type: 'string', enum: ['true', 'false'] },
        });
      });

      it.each(['true', 'false'])(
        'accepts %s and preserves capacity conversion',
        async (value) => {
          await request(app.getHttpServer())
            .get('/api/rooms')
            .query({ [filter]: value, capacity: '8' })
            .expect(200);

          expect(mockRoomsService.findAll).toHaveBeenCalledWith({
            [filter]: value,
            capacity: 8,
          });
        },
      );

      it.each(['1', '0', 'yes', 'no', 'TRUE', 'FALSE', '', ' true '])(
        'rejects invalid value "%s" before calling the service',
        async (value) => {
          await request(app.getHttpServer())
            .get('/api/rooms')
            .query({ [filter]: value })
            .expect(400);

          expect(mockRoomsService.findAll).not.toHaveBeenCalled();
        },
      );
    },
  );

  it('rejects unauthenticated room creation with 401 before calling the service', async () => {
    await request(app.getHttpServer())
      .post('/api/rooms')
      .send(createRoomDto)
      .expect(401);

    expect(mockRoomsService.create).not.toHaveBeenCalled();
  });

  it('rejects USER room creation with 403 before calling the service', async () => {
    await request(app.getHttpServer())
      .post('/api/rooms')
      .auth(token, { type: 'bearer' })
      .send(createRoomDto)
      .expect(403, {
        statusCode: 403,
        message: 'Administrator access required',
        error: 'Forbidden',
      });

    expect(mockRoomsService.create).not.toHaveBeenCalled();
  });

  it('allows public room listing and ADMIN creation with documented response schemas', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/rooms')
      .expect(200);
    const rooms = response.body as Record<string, unknown>[];
    expectFields('RoomResponseDto', rooms[0]);
    expect(schema('RoomResponseDto').properties).toMatchObject({
      capacity: { type: 'integer' },
      createdAt: { type: 'string', format: 'date-time' },
      hasProjector: { type: 'boolean' },
      hasWhiteboard: { type: 'boolean' },
    });
    await request(app.getHttpServer())
      .post('/api/rooms')
      .auth(adminToken, { type: 'bearer' })
      .send(createRoomDto)
      .expect(201, rooms[0]);
    expect(mockRoomsService.create).toHaveBeenCalledTimes(1);
    expect(mockRoomsService.create).toHaveBeenCalledWith(createRoomDto);
    expect(responseSchema('/api/rooms', 'get', 200)).toEqual({
      type: 'array',
      items: { $ref: '#/components/schemas/RoomResponseDto' },
    });
    expect(responseSchema('/api/rooms', 'post', 201)).toEqual({
      $ref: '#/components/schemas/RoomResponseDto',
    });
  });

  it.each(['startTime', 'endTime'])(
    'documents the reservation %s timestamp format',
    (field) => {
      const property = schema('CreateReservationDto').properties![field];
      if ('$ref' in property || !property.pattern) {
        throw new Error('Expected an inline timestamp schema with a pattern');
      }
      expect(property.type).toBe('string');
      expect(property.format).toBe('date-time');
      expect(property.description).toContain('Z or ±HH:mm');
      const pattern = new RegExp(property.pattern);
      expect(pattern.test('2026-08-10T10:00:00Z')).toBe(true);
      expect(pattern.test('2026-08-10T12:00:00.123+02:00')).toBe(true);
      expect(pattern.test('2026-08-10')).toBe(false);
      expect(pattern.test('2026-W33-1')).toBe(false);
      expect(pattern.test('2026-08-10T10:00:00')).toBe(false);
    },
  );

  it('documents the reservation mapper fields including nested schemas', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/reservations/me')
      .auth(token, { type: 'bearer' })
      .expect(200);
    const reservations = response.body as Record<string, unknown>[];
    expectFields('ReservationResponseDto', reservations[0]);
    expectFields('ReservationRoomResponseDto', reservation.room);
    expectFields('ReservationUserResponseDto', reservation.user);
    expect(schema('ReservationResponseDto').properties).toMatchObject({
      room: {
        allOf: [{ $ref: '#/components/schemas/ReservationRoomResponseDto' }],
      },
      user: {
        allOf: [{ $ref: '#/components/schemas/ReservationUserResponseDto' }],
      },
    });
    await request(app.getHttpServer())
      .post('/api/reservations')
      .auth(token, { type: 'bearer' })
      .send({
        roomId: room.id,
        startTime: reservation.startTime.toISOString(),
        endTime: reservation.endTime.toISOString(),
      })
      .expect(201, reservations[0]);
    expect(responseSchema('/api/reservations', 'post', 201)).toEqual({
      $ref: '#/components/schemas/ReservationResponseDto',
    });
    expect(responseSchema('/api/reservations/me', 'get', 200)).toEqual({
      type: 'array',
      items: { $ref: '#/components/schemas/ReservationResponseDto' },
    });
  });

  it('documents deletion as 200 with no response body', async () => {
    const response = await request(app.getHttpServer())
      .delete(`/api/reservations/${reservation.id}`)
      .auth(token, { type: 'bearer' })
      .expect(200);
    expect(response.text).toBe('');
    expect(mockRemoveReservation).toHaveBeenCalledTimes(1);
    expect(mockRemoveReservation).toHaveBeenCalledWith(
      reservation.id,
      user.id,
      user.role,
    );
    const documented =
      document.paths['/api/reservations/{id}'].delete!.responses['200'];
    expect(documented).not.toHaveProperty('content');
  });

  it('documents the deletion ID as a required UUID', () => {
    expect(document.paths['/api/reservations/{id}'].delete!.parameters).toEqual(
      [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Reservation UUID',
          schema: { type: 'string', format: 'uuid' },
        },
      ],
    );
  });

  it.each(['not-a-uuid', '550e8400-e29b-41d4-a716-44665544000g'])(
    'rejects malformed deletion ID %s before calling the service',
    async (id) => {
      await request(app.getHttpServer())
        .delete(`/api/reservations/${id}`)
        .auth(token, { type: 'bearer' })
        .expect(400, {
          statusCode: 400,
          error: 'Bad Request',
          message: 'Validation failed (uuid is expected)',
        });
      expect(mockRemoveReservation).not.toHaveBeenCalled();
    },
  );

  it.each([reservation.id, 'not-a-uuid'])(
    'preserves 401 for unauthenticated deletion of %s',
    async (id) => {
      await request(app.getHttpServer())
        .delete(`/api/reservations/${id}`)
        .expect(401);
      expect(mockRemoveReservation).not.toHaveBeenCalled();
    },
  );

  it.each([
    [
      403,
      new ForbiddenException('You are not allowed to delete this reservation'),
    ],
    [404, new NotFoundException('Reservation not found')],
  ] as const)(
    'preserves service HTTP %s errors for a valid deletion UUID',
    async (status, error) => {
      mockRemoveReservation.mockRejectedValueOnce(error);
      await request(app.getHttpServer())
        .delete(`/api/reservations/${reservation.id}`)
        .auth(token, { type: 'bearer' })
        .expect(status)
        .expect({
          statusCode: status,
          message: error.message,
          error: status === 403 ? 'Forbidden' : 'Not Found',
        });
      expect(mockRemoveReservation).toHaveBeenCalledWith(
        reservation.id,
        user.id,
        user.role,
      );
    },
  );

  it('preserves authentication and documents the implemented error statuses', async () => {
    await request(app.getHttpServer()).get('/api/users/me').expect(401);
    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({})
      .expect(400);
    expect(
      Object.keys(document.paths['/api/auth/login'].post!.responses).sort(),
    ).toEqual(['201', '400', '401']);
    expect(
      Object.keys(document.paths['/api/rooms'].post!.responses).sort(),
    ).toEqual(['201', '400', '401', '403']);
    expect(document.paths['/api/rooms'].post!.summary).toContain('ADMIN');
    expect(
      Object.keys(document.paths['/api/reservations'].post!.responses).sort(),
    ).toEqual(['201', '400', '401', '404']);
    expect(
      Object.keys(
        document.paths['/api/reservations/{id}'].delete!.responses,
      ).sort(),
    ).toEqual(['200', '400', '401', '403', '404']);
  });
});
