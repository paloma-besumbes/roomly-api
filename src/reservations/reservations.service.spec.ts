import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { createMockUser } from '../../test/factories/user.factory';
import { createMockRoom } from '../../test/factories/room.factory';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ReservationsService } from './reservations.service';

import { Reservation } from './entities/reservation.entity';
import { ReservationMapper } from './mappers/reservation.mapper';

import { Room } from '../rooms/room.entity';

import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/entities/user-role.enum';
import { createMockReservation } from '../../test/factories/reservation.factory';

describe('ReservationsService', () => {
  let service: ReservationsService;

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getOne: jest.fn(),
  };

  const mockReservationsRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
  };

  const mockRoomsRepository = {
    findOne: jest.fn(),
  };

  const mockUsersRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationsService,
        {
          provide: getRepositoryToken(Reservation),
          useValue: mockReservationsRepository,
        },
        {
          provide: getRepositoryToken(Room),
          useValue: mockRoomsRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUsersRepository,
        },
      ],
    }).compile();

    service = module.get<ReservationsService>(ReservationsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw NotFoundException when user does not exist', async () => {
      const createReservationDto = {
        roomId: 'room-1',
        startTime: '2026-08-10T10:00:00.000Z',
        endTime: '2026-08-10T11:00:00.000Z',
      };

      mockUsersRepository.findOne.mockResolvedValue(null);

      await expect(
        service.create(createReservationDto, 'user-1'),
      ).rejects.toThrow(NotFoundException);

      expect(mockUsersRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: 'user-1',
        },
      });

      expect(mockRoomsRepository.findOne).not.toHaveBeenCalled();

      expect(mockReservationsRepository.create).not.toHaveBeenCalled();

      expect(mockReservationsRepository.save).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when room does not exist', async () => {
      const createReservationDto = {
        roomId: 'room-1',
        startTime: '2026-08-10T10:00:00.000Z',
        endTime: '2026-08-10T11:00:00.000Z',
      };

      const user = createMockUser();

      mockUsersRepository.findOne.mockResolvedValue(user);

      mockRoomsRepository.findOne.mockResolvedValue(null);

      await expect(
        service.create(createReservationDto, user.id),
      ).rejects.toThrow(NotFoundException);

      expect(mockUsersRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: user.id,
        },
      });

      expect(mockRoomsRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: createReservationDto.roomId,
        },
      });

      expect(mockReservationsRepository.create).not.toHaveBeenCalled();

      expect(mockReservationsRepository.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when the room is already reserved', async () => {
      const createReservationDto = {
        roomId: 'room-1',
        startTime: '2026-08-10T10:00:00.000Z',
        endTime: '2026-08-10T11:00:00.000Z',
      };

      const user = createMockUser();

      const room = createMockRoom();
      const reservation = createMockReservation({
        room,
        user,
      });

      mockUsersRepository.findOne.mockResolvedValue(user);

      mockRoomsRepository.findOne.mockResolvedValue(room);

      mockQueryBuilder.getOne.mockResolvedValue(reservation);

      await expect(
        service.create(createReservationDto, user.id),
      ).rejects.toThrow(BadRequestException);

      expect(
        mockReservationsRepository.createQueryBuilder,
      ).toHaveBeenCalledWith('reservation');

      expect(mockQueryBuilder.where).toHaveBeenCalled();

      expect(mockQueryBuilder.andWhere).toHaveBeenCalled();

      expect(mockQueryBuilder.getOne).toHaveBeenCalled();

      expect(mockReservationsRepository.create).not.toHaveBeenCalled();

      expect(mockReservationsRepository.save).not.toHaveBeenCalled();
    });

    it('should create a reservation successfully', async () => {
      const createReservationDto = {
        roomId: 'room-1',
        startTime: '2026-08-10T10:00:00.000Z',
        endTime: '2026-08-10T11:00:00.000Z',
      };

      const user = createMockUser();

      const room = createMockRoom();
      const reservation = createMockReservation({
        room,
        user,
      });

      mockUsersRepository.findOne.mockResolvedValue(user);

      mockRoomsRepository.findOne.mockResolvedValue(room);

      mockQueryBuilder.getOne.mockResolvedValue(null);

      mockReservationsRepository.create.mockReturnValue(reservation);

      mockReservationsRepository.save.mockResolvedValue(reservation);

      const result = await service.create(createReservationDto, user.id);

      expect(mockReservationsRepository.create).toHaveBeenCalledWith({
        startTime: new Date(createReservationDto.startTime),
        endTime: new Date(createReservationDto.endTime),
        room,
        user,
      });

      expect(mockReservationsRepository.save).toHaveBeenCalledWith(reservation);

      expect(result).toEqual({
        id: reservation.id,
        startTime: reservation.startTime,
        endTime: reservation.endTime,
        createdAt: reservation.createdAt,
        room: {
          id: room.id,
          name: room.name,
          description: room.description,
          capacity: room.capacity,
          hasProjector: room.hasProjector,
          hasWhiteboard: room.hasWhiteboard,
        },
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      });
    });
  });

  describe('findMyReservations', () => {
    it('should return the user reservations', async () => {
      const user = createMockUser();

      const reservation = createMockReservation({
        user,
      });

      mockReservationsRepository.find.mockResolvedValue([reservation]);

      const mapperSpy = jest.spyOn(ReservationMapper, 'toResponseDto');

      const result = await service.findMyReservations(user.id);

      expect(mockReservationsRepository.find).toHaveBeenCalledWith({
        where: {
          user: {
            id: user.id,
          },
        },
        order: {
          startTime: 'ASC',
        },
      });

      expect(mapperSpy).toHaveBeenCalledTimes(1);

      expect(mapperSpy).toHaveBeenCalledWith(reservation);

      expect(result).toEqual([ReservationMapper.toResponseDto(reservation)]);
    });
  });
  describe('remove', () => {
    it('should throw NotFoundException when reservation does not exist', async () => {
      mockReservationsRepository.findOne.mockResolvedValue(null);

      await expect(
        service.remove('reservation-1', 'user-1', UserRole.USER),
      ).rejects.toThrow(NotFoundException);

      expect(mockReservationsRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: 'reservation-1',
        },
        relations: ['user'],
      });
    });
    it('should delete the reservation when the user is the owner', async () => {
      const reservation = createMockReservation({
        user: createMockUser({
          id: 'owner-id',
        }),
      });

      mockReservationsRepository.findOne.mockResolvedValue(reservation);

      mockReservationsRepository.remove.mockResolvedValue(undefined);

      await service.remove(reservation.id, reservation.user.id, UserRole.USER);

      expect(mockReservationsRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: reservation.id,
        },
        relations: ['user'],
      });

      expect(mockReservationsRepository.remove).toHaveBeenCalledWith(
        reservation,
      );
    });

    it('should throw ForbiddenException when the user is not the owner or an admin', async () => {
      const reservation = createMockReservation({
        user: createMockUser({
          id: 'owner-id',
        }),
      });

      mockReservationsRepository.findOne.mockResolvedValue(reservation);

      await expect(
        service.remove(reservation.id, 'another-user', UserRole.USER),
      ).rejects.toThrow(ForbiddenException);

      expect(mockReservationsRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: reservation.id,
        },
        relations: ['user'],
      });

      expect(mockReservationsRepository.remove).not.toHaveBeenCalled();
    });
    it('should delete the reservation when the user is an admin', async () => {
      const reservation = createMockReservation({
        user: createMockUser({
          id: 'owner-id',
        }),
      });

      mockReservationsRepository.findOne.mockResolvedValue(reservation);

      mockReservationsRepository.remove.mockResolvedValue(undefined);

      await service.remove(reservation.id, 'admin-id', UserRole.ADMIN);

      expect(mockReservationsRepository.remove).toHaveBeenCalledWith(
        reservation,
      );
    });
  });
});
