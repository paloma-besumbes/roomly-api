import { Controller, Body, Post, Request, UseGuards } from '@nestjs/common';

import { ReservationService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import type { Request as ExpressRequest } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../users/entities/user.entity';

@Controller('reservations')
export class ReservationsController {}
