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
    it('should return all users', async () => {
      const users = [createMockUser()];

      mockUsersRepository.find.mockResolvedValue(users);

      const result = await service.findAll();

      expect(result).toEqual(users);

      expect(mockUsersRepository.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('findById', () => {
    it('should return the user when it exists', async () => {
      const user = createMockUser();

      mockUsersRepository.findOne.mockResolvedValue(user);

      const result = await service.findById('1');

      expect(result).toEqual(user);

      expect(mockUsersRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: '1',
        },
      });
    });

    it('should return null when the user does not exist', async () => {
      mockUsersRepository.findOne.mockResolvedValue(null);

      const result = await service.findById('999');

      expect(result).toBeNull();

      expect(mockUsersRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: '999',
        },
      });
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
