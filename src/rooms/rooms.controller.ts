import { Get, Query, Controller, Body, Post } from '@nestjs/common';
import { FilterRoomsDto } from './dto/filter-rooms.dto';
import { RoomsService } from './rooms.service';

import { CreateRoomDto } from './dto/create-room.dto';

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Get()
  findAll(@Query() filters: FilterRoomsDto) {
    return this.roomsService.findAll(filters);
  }

  @Post()
  create(@Body() createRoomDto: CreateRoomDto) {
    return this.roomsService.create(createRoomDto);
  }
}
