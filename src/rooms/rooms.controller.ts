import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { AdminGuard } from '../auth/guards/admin.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateRoomDto } from './dto/create-room.dto';
import { FilterRoomsDto } from './dto/filter-rooms.dto';
import { RoomResponseDto } from './dto/room-response.dto';
import { RoomsService } from './rooms.service';

@ApiTags('Rooms')
@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @ApiOperation({
    summary: 'Get all rooms',
  })
  @ApiOkResponse({
    description: 'List of rooms',
    type: RoomResponseDto,
    isArray: true,
  })
  @ApiBadRequestResponse({ description: 'Invalid room filters' })
  @Get()
  findAll(@Query() filters: FilterRoomsDto): Promise<RoomResponseDto[]> {
    return this.roomsService.findAll(filters);
  }

  @ApiOperation({
    summary: 'Create a new room (ADMIN only)',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiCreatedResponse({
    description: 'Room created successfully',
    type: RoomResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid room input' })
  @ApiUnauthorizedResponse({ description: 'Missing, invalid or expired JWT' })
  @ApiForbiddenResponse({ description: 'Administrator access required' })
  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  create(@Body() createRoomDto: CreateRoomDto): Promise<RoomResponseDto> {
    return this.roomsService.create(createRoomDto);
  }
}
