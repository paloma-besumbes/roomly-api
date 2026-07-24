import { Test, TestingModule } from '@nestjs/testing';

import type { Request } from 'express';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';

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

      const request = {
        user,
      } as Request;

      const result = controller.getProfile(request);

      expect(result).toEqual(user);
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const users = [createMockUser()];

      mockUsersService.findAll.mockResolvedValue(users);

      const result = await controller.findAll();

      expect(mockUsersService.findAll).toHaveBeenCalledTimes(1);

      expect(result).toEqual(users);
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
