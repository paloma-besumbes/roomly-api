import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Reservation } from './entities/reservation.entity';

import { CreateReservationDto } from './dto/create-reservation.dto';
import { ReservationResponseDto } from './dto/reservation-response.dto';

import { ReservationMapper } from './mappers/reservation.mapper';

import { Room } from '../rooms/room.entity';

import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/entities/user-role.enum';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation)
    private reservationsRepository: Repository<Reservation>,

    @InjectRepository(Room)
    private roomsRepository: Repository<Room>,

    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(
    createReservationDto: CreateReservationDto,
    userId: string,
  ): Promise<ReservationResponseDto> {
    // Buscamos el usuario autenticado
    const user = await this.usersRepository.findOne({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const room = await this.roomsRepository.findOne({
      where: {
        id: createReservationDto.roomId,
      },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    const conflictingReservation = await this.reservationsRepository
      .createQueryBuilder('reservation')
      .where('reservation.roomId = :roomId', {
        roomId: room.id,
      })
      .andWhere(
        'reservation.startTime < :endTime AND reservation.endTime > :startTime',
        {
          startTime: createReservationDto.startTime,
          endTime: createReservationDto.endTime,
        },
      )
      .getOne();

    if (conflictingReservation) {
      throw new BadRequestException(
        'The room is already reserved for that time slot',
      );
    }

    const reservation = this.reservationsRepository.create({
      startTime: new Date(createReservationDto.startTime),
      endTime: new Date(createReservationDto.endTime),
      room,
      user,
    });

    const savedReservation =
      await this.reservationsRepository.save(reservation);

    return ReservationMapper.toResponseDto(savedReservation);
  }

  async findMyReservations(userId: string): Promise<ReservationResponseDto[]> {
    const reservations = await this.reservationsRepository.find({
      where: {
        user: {
          id: userId,
        },
      },
      order: {
        startTime: 'ASC',
      },
    });

    return reservations.map((reservation) =>
      ReservationMapper.toResponseDto(reservation),
    );
  }

  async remove(
    reservationId: string,
    userId: string,
    userRole: UserRole,
  ): Promise<void> {
    const reservation = await this.reservationsRepository.findOne({
      where: {
        id: reservationId,
      },
      relations: ['user'],
    });

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    const isOwner = reservation.user.id === userId;

    const isAdmin = userRole === UserRole.ADMIN;

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException(
        'You are not allowed to delete this reservation',
      );
    }

    await this.reservationsRepository.remove(reservation);
  }
}
