import { Test, TestingModule } from '@nestjs/testing';

import { RoomsController } from './rooms.controller';
import { RoomsService } from './rooms.service';

import { createMockRoom } from '../../test/factories/room.factory';

describe('RoomsController', () => {
  let controller: RoomsController;

  const mockRoomsService = {
    findAll: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoomsController],
      providers: [
        {
          provide: RoomsService,
          useValue: mockRoomsService,
        },
      ],
    }).compile();

    controller = module.get<RoomsController>(RoomsController);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all rooms', async () => {
      const filters = {
        capacity: 8,
        hasProjector: 'true',
      };

      const rooms = [createMockRoom()];

      mockRoomsService.findAll.mockResolvedValue(rooms);

      const result = await controller.findAll(filters);

      expect(mockRoomsService.findAll).toHaveBeenCalledWith(filters);

      expect(result).toEqual(rooms);
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

      mockRoomsService.create.mockResolvedValue(room);

      const result = await controller.create(createRoomDto);

      expect(mockRoomsService.create).toHaveBeenCalledWith(createRoomDto);

      expect(result).toEqual(room);
    });
  });
});
