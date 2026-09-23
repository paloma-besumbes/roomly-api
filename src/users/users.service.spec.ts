import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

import { UsersService } from './users.service';
import { User } from './entities/user.entity';

import { createMockUser } from '../../test/factories/user.factory';

describe('UsersService', () => {
  let service: UsersService;

  const mockUsersRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUsersRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return public user fields without exposing password hashes', async () => {
      const users = [
        createMockUser(),
        createMockUser({
          id: 'user-2',
          email: 'jane@example.com',
          password: 'another-password-hash',
          firstName: 'Jane',
        }),
      ];

      mockUsersRepository.find.mockResolvedValue(users);

      const result = await service.findAll();

      expect(result).toHaveLength(users.length);

      result.forEach((response, index) => {
        const user = users[index];

        expect(response).toEqual({
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        });
        expect(response).not.toHaveProperty('password');
      });

      expect(users[0].password).toBe('hashed-password');
      expect(users[1].password).toBe('another-password-hash');

      expect(mockUsersRepository.find).toHaveBeenCalledTimes(1);
    });

    it('should return an empty list when no users exist', async () => {
      mockUsersRepository.find.mockResolvedValue([]);

      await expect(service.findAll()).resolves.toEqual([]);
    });
  });

  describe('findByEmail', () => {
    it('should return the user when the email exists', async () => {
      const user = createMockUser({
        email: 'john@example.com',
      });

      mockUsersRepository.findOne.mockResolvedValue(user);

      const result = await service.findByEmail('john@example.com');

      expect(result).toEqual(user);

      expect(mockUsersRepository.findOne).toHaveBeenCalledWith({
        where: {
          email: 'john@example.com',
        },
      });
    });

    it('should return null when the email does not exist', async () => {
      mockUsersRepository.findOne.mockResolvedValue(null);

      const result = await service.findByEmail('missing@example.com');

      expect(result).toBeNull();

      expect(mockUsersRepository.findOne).toHaveBeenCalledWith({
        where: {
          email: 'missing@example.com',
        },
      });
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto = {
        email: 'john@example.com',
        password: '123456',
        firstName: 'John',
        lastName: 'Doe',
      };

      const hashedPassword = 'hashed-password';

      const user = createMockUser({
        email: createUserDto.email,
        password: hashedPassword,
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
      });

      mockUsersRepository.findOne.mockResolvedValue(null);

      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      mockUsersRepository.create.mockReturnValue(user);

      mockUsersRepository.save.mockResolvedValue(user);

      const result = await service.create(createUserDto);

      expect(mockUsersRepository.findOne).toHaveBeenCalledWith({
        where: {
          email: createUserDto.email,
        },
      });

      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);

      expect(mockUsersRepository.create).toHaveBeenCalled();

      expect(mockUsersRepository.save).toHaveBeenCalledWith(user);

      expect(result.email).toBe(createUserDto.email);

      expect(result.firstName).toBe(createUserDto.firstName);

      expect(result.lastName).toBe(createUserDto.lastName);

      expect(result).not.toHaveProperty('password');
    });

    it('should throw BadRequestException if email already exists', async () => {
      const createUserDto = {
        email: 'john@example.com',
        password: '123456',
        firstName: 'John',
        lastName: 'Doe',
      };

      const existingUser = createMockUser({
        email: createUserDto.email,
      });

      mockUsersRepository.findOne.mockResolvedValue(existingUser);

      await expect(service.create(createUserDto)).rejects.toThrow(
        BadRequestException,
      );

      expect(mockUsersRepository.findOne).toHaveBeenCalledWith({
        where: {
          email: createUserDto.email,
        },
      });

      expect(mockUsersRepository.create).not.toHaveBeenCalled();

      expect(mockUsersRepository.save).not.toHaveBeenCalled();
    });
  });
});
