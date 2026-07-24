import { Test, TestingModule } from '@nestjs/testing';

import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';

import { createMockReservation } from '../../test/factories/reservation.factory';
import { createMockUser } from '../../test/factories/user.factory';
import type { Request } from 'express';
import { UserRole } from '../users/entities/user-role.enum';

describe('ReservationsController', () => {
  let controller: ReservationsController;

  const mockReservationsService = {
    create: jest.fn(),
    findMyReservations: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReservationsController],
      providers: [
        {
          provide: ReservationsService,
          useValue: mockReservationsService,
        },
      ],
    }).compile();

    controller = module.get<ReservationsController>(ReservationsController);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a reservation', async () => {
      const createReservationDto = {
        roomId: 'room-1',
        startTime: '2026-01-01T10:00:00Z',
        endTime: '2026-01-01T11:00:00Z',
      };

      const user = createMockUser();

      const req = {
        user: {
          userId: user.id,
          email: user.email,
          role: user.role,
        },
      } as Request & {
        user: {
          userId: string;
          email: string;
          role: UserRole;
        };
      };

      const reservation = createMockReservation();

      mockReservationsService.create.mockResolvedValue(reservation);

      const result = await controller.create(createReservationDto, req);

      expect(mockReservationsService.create).toHaveBeenCalledWith(
        createReservationDto,
        user.id,
      );

      expect(result).toEqual(reservation);
    });
  });

  describe('getMyReservations', () => {
    it('should return the authenticated user reservations', async () => {
      const user = createMockUser();

      const req = {
        user: {
          userId: user.id,
          email: user.email,
          role: user.role,
        },
      } as Request & {
        user: {
          userId: string;
          email: string;
          role: UserRole;
        };
      };

      const reservations = [createMockReservation()];

      mockReservationsService.findMyReservations.mockResolvedValue(
        reservations,
      );

      const result = await controller.getMyReservations(req);

      expect(mockReservationsService.findMyReservations).toHaveBeenCalledWith(
        user.id,
      );

      expect(result).toEqual(reservations);
    });
  });

  describe('remove', () => {
    it('should delete a reservation', async () => {
      const user = createMockUser();

      const req = {
        user: {
          userId: user.id,
          email: user.email,
          role: user.role,
        },
      } as Request & {
        user: {
          userId: string;
          email: string;
          role: UserRole;
        };
      };

      mockReservationsService.remove.mockResolvedValue(undefined);

      const result = await controller.remove('reservation-1', req);

      expect(mockReservationsService.remove).toHaveBeenCalledWith(
        'reservation-1',
        user.id,
        user.role,
      );

      expect(result).toBeUndefined();
    });
  });
});
