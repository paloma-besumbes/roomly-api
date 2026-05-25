import { Get, Query, Controller, Body, Post } from '@nestjs/common';
import { FilterRoomsDto } from './dto/filter-rooms.dto';
import { RoomsService } from './rooms.service';

import { CreateRoomDto } from './dto/create-room.dto';

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Get()
  async findAll(@Query() filters: FilterRoomsDto) {
    return await this.roomsService.findAll(filters);
  }

  @Post()
  async create(@Body() createRoomDto: CreateRoomDto) {
    return await this.roomsService.create(createRoomDto);
  }
}
