import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { RoomsService } from './rooms.service';
import { Room } from './room.entity';

import { createMockRoom } from '../../test/factories/room.factory';

describe('RoomsService', () => {
  let service: RoomsService;

  const mockQueryBuilder = {
    andWhere: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
  };

  const mockRoomsRepository = {
    create: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoomsService,
        {
          provide: getRepositoryToken(Room),
          useValue: mockRoomsRepository,
        },
      ],
    }).compile();

    service = module.get<RoomsService>(RoomsService);

    jest.clearAllMocks();

    mockRoomsRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all rooms without filters', async () => {
      const rooms = [createMockRoom()];

      mockQueryBuilder.getMany.mockResolvedValue(rooms);

      const result = await service.findAll({});

      expect(result).toEqual(rooms);

      expect(mockRoomsRepository.createQueryBuilder).toHaveBeenCalledWith(
        'room',
      );

      expect(mockQueryBuilder.getMany).toHaveBeenCalled();
    });

    it('should filter by capacity', async () => {
      const rooms = [createMockRoom()];

      mockQueryBuilder.getMany.mockResolvedValue(rooms);

      await service.findAll({
        capacity: 8,
      });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'room.capacity >= :capacity',
        {
          capacity: 8,
        },
      );
    });

    it('should filter by projector', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([]);

      await service.findAll({
        hasProjector: 'true',
      });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'room.hasProjector = :hasProjector',
        {
          hasProjector: true,
        },
      );
    });

    it('should filter by whiteboard', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([]);

      await service.findAll({
        hasWhiteboard: 'true',
      });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'room.hasWhiteboard = :hasWhiteboard',
        {
          hasWhiteboard: true,
        },
      );
    });

    it('should apply all filters', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([]);

      await service.findAll({
        capacity: 10,
        hasProjector: 'true',
        hasWhiteboard: 'true',
      });

      expect(mockQueryBuilder.andWhere).toHaveBeenNthCalledWith(
        1,
        'room.capacity >= :capacity',
        {
          capacity: 10,
        },
      );

      expect(mockQueryBuilder.andWhere).toHaveBeenNthCalledWith(
        2,
        'room.hasProjector = :hasProjector',
        {
          hasProjector: true,
        },
      );

      expect(mockQueryBuilder.andWhere).toHaveBeenNthCalledWith(
        3,
        'room.hasWhiteboard = :hasWhiteboard',
        {
          hasWhiteboard: true,
        },
      );
    });
  });

  describe('create', () => {
    it('should create a room', async () => {
      const createRoomDto = {
        name: 'Room A',
        description: 'Large meeting room',
        capacity: 8,
        hasProjector: true,
        hasWhiteboard: true,
      };

      const room = createMockRoom(createRoomDto);

      mockRoomsRepository.create.mockReturnValue(room);

      mockRoomsRepository.save.mockResolvedValue(room);

      const result = await service.create(createRoomDto);

      expect(mockRoomsRepository.create).toHaveBeenCalledWith(createRoomDto);

      expect(mockRoomsRepository.save).toHaveBeenCalledWith(room);

      expect(result).toEqual(room);
    });
  });
});
