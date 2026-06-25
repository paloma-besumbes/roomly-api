import { Injectable, NotFoundException } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Reservation } from './entities/reservation.entity';

import { CreateReservationDto } from './dto/create-reservation.dto';

import { Room } from '../rooms/room.entity';

import { User } from '../users/entities/user.entity';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation)
    private reservationsRepository: Repository<Reservation>,

    @InjectRepository(Room)
    private roomsRepository: Repository<Room>,
  ) {}

  async create(
    createReservationDto: CreateReservationDto,
    user: User,
  ): Promise<Reservation> {
    const room = await this.roomsRepository.findOne({
      where: {
        id: createReservationDto.roomId,
      },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    const reservation = this.reservationsRepository.create({
      startTime: new Date(createReservationDto.startTime),

      endTime: new Date(createReservationDto.endTime),
      room,
      user,
    });

    return await this.reservationsRepository.save(reservation);
  }
}
