import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { CreateReservationDto } from './dto/create-reservation.dto';

import { ReservationsService } from './reservations.service';

import { UserRole } from '../users/entities/user-role.enum';

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Body() createReservationDto: CreateReservationDto,
    @Request()
    req: ExpressRequest & {
      user: {
        userId: string;
        email: string;
        role: UserRole;
      };
    },
  ) {
    return this.reservationsService.create(
      createReservationDto,
      req.user.userId,
    );
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMyReservations(
    @Request()
    req: ExpressRequest & {
      user: {
        userId: string;
        email: string;
        role: UserRole;
      };
    },
  ) {
    return this.reservationsService.findMyReservations(req.user.userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(
    @Param('id') reservationId: string,
    @Request()
    req: ExpressRequest & {
      user: {
        userId: string;
        email: string;
        role: UserRole;
      };
    },
  ) {
    return this.reservationsService.remove(
      reservationId,
      req.user.userId,
      req.user.role,
    );
  }
}
