import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { CreateRoomDto } from './dto/create-room.dto';
import { FilterRoomsDto } from './dto/filter-rooms.dto';
import { Room } from './room.entity';
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
    type: Room,
    isArray: true,
  })
  @Get()
  findAll(@Query() filters: FilterRoomsDto) {
    return this.roomsService.findAll(filters);
  }

  @ApiOperation({
    summary: 'Create a new room',
  })
  @ApiCreatedResponse({
    description: 'Room created successfully',
    type: Room,
  })
  @Post()
  create(@Body() createRoomDto: CreateRoomDto) {
    return this.roomsService.create(createRoomDto);
  }
}
