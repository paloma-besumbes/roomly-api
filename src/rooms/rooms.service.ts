import { Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Room } from './room.entity';

import { CreateRoomDto } from './dto/create-room.dto';

import { FilterRoomsDto } from './dto/filter-rooms.dto';

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(Room)
    private roomsRepository: Repository<Room>,
  ) {}

  async findAll(filters: FilterRoomsDto): Promise<Room[]> {
    const query = this.roomsRepository.createQueryBuilder('room');

    // Min capacity filter
    if (filters.capacity) {
      query.andWhere('room.capacity >= :capacity', {
        capacity: filters.capacity,
      });
    }

    // Projector filter

    if (filters.hasProjector) {
      query.andWhere('room.hasProjector = :hasProjector', {
        hasProjector: filters.hasProjector === 'true',
      });
    }

    if (filters.hasWhiteboard) {
      query.andWhere('room.hasWhiteboard = :hasWhiteboard', {
        hasWhiteboard: filters.hasWhiteboard === 'true',
      });
    }

    return await query.getMany();
  }

  async create(createRoomDto: CreateRoomDto): Promise<Room> {
    const room = this.roomsRepository.create(createRoomDto);

    return await this.roomsRepository.save(room);
  }
}
