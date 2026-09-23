import { Test, TestingModule } from '@nestjs/testing';

import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserMapper } from './mappers/user.mapper';
import { UserProfileResponseDto } from './dto/user-profile-response.dto';

import { createMockUser } from '../../test/factories/user.factory';

describe('UsersController', () => {
  let controller: UsersController;

  const mockUsersService = {
    findAll: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getProfile', () => {
    it('should return the authenticated user', () => {
      const user = createMockUser();
      const identity: UserProfileResponseDto = {
        userId: user.id,
        email: user.email,
        role: user.role,
      };

      const request = {
        user: identity,
      } as AuthenticatedRequest;

      const result = controller.getProfile(request);

      expect(result).toEqual(identity);
    });
  });

  describe('findAll', () => {
    it('should return public user responses from the service', async () => {
      const users = [UserMapper.toResponse(createMockUser())];

      mockUsersService.findAll.mockResolvedValue(users);

      const result = await controller.findAll();

      expect(mockUsersService.findAll).toHaveBeenCalledTimes(1);

      expect(result).toEqual(users);
      expect(result[0]).not.toHaveProperty('password');
    });
  });

  describe('create', () => {
    it('should create a user', async () => {
      const createUserDto = {
        email: 'john@example.com',
        password: '123456',
        firstName: 'John',
        lastName: 'Doe',
      };

      const createdUser = {
        id: '1',
        email: createUserDto.email,
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        role: 'USER',
      };

      mockUsersService.create.mockResolvedValue(createdUser);

      const result = await controller.create(createUserDto);

      expect(mockUsersService.create).toHaveBeenCalledWith(createUserDto);

      expect(result).toEqual(createdUser);
    });
  });
});
