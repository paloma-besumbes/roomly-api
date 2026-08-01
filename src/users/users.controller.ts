import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Body, Post, Controller, Get, Req, UseGuards } from '@nestjs/common';

import type { Request } from 'express';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateUserDto } from './dto/create-user.dto';

import { UserResponseDto } from './dto/user-response.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get the authenticated user profile',
  })
  @ApiOkResponse({
    description: 'Authenticated user profile',
    type: UserResponseDto,
  })
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Req() request: Request) {
    return request.user;
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all users',
  })
  @ApiOkResponse({
    description: 'List of users',
    type: UserResponseDto,
    isArray: true,
  })
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @ApiOperation({
    summary: 'Create a new user',
  })
  @ApiCreatedResponse({
    description: 'User created successfully',
    type: UserResponseDto,
  })
  @Post()
  create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return this.usersService.create(createUserDto);
  }
}
