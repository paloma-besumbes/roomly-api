import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

import { createMockUser } from '../../test/factories/user.factory';

describe('AuthService', () => {
  let service: AuthService;

  const mockUsersService = {
    findByEmail: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should login successfully', async () => {
      const loginDto = {
        email: 'john@example.com',
        password: '123456',
      };

      const user = createMockUser({
        email: loginDto.email,
        password: 'hashed-password',
      });

      mockUsersService.findByEmail.mockResolvedValue(user);

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      mockJwtService.signAsync.mockResolvedValue('fake-jwt-token');

      const result = await service.login(loginDto);

      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(loginDto.email);

      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginDto.password,
        user.password,
      );

      expect(mockJwtService.signAsync).toHaveBeenCalledWith({
        sub: user.id,
        email: user.email,
        role: user.role,
      });

      expect(result).toEqual({
        accessToken: 'fake-jwt-token',
      });
    });

    it('should throw UnauthorizedException when user does not exist', async () => {
      const loginDto = {
        email: 'john@example.com',
        password: '123456',
      };

      mockUsersService.findByEmail.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(mockJwtService.signAsync).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      const loginDto = {
        email: 'john@example.com',
        password: '123456',
      };

      const user = createMockUser({
        email: loginDto.email,
      });

      mockUsersService.findByEmail.mockResolvedValue(user);

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(mockJwtService.signAsync).not.toHaveBeenCalled();
    });
  });
});
