import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { CreateReservationDto } from './dto/create-reservation.dto';
import { ReservationResponseDto } from './dto/reservation-response.dto';
import { ReservationsService } from './reservations.service';

@ApiTags('Reservations')
@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Create a reservation',
  })
  @ApiCreatedResponse({
    description: 'Reservation created successfully',
    type: ReservationResponseDto,
  })
  @ApiBadRequestResponse({
    description:
      'Invalid input or the room is already reserved for that time slot',
  })
  @ApiUnauthorizedResponse({ description: 'Missing, invalid or expired JWT' })
  @ApiNotFoundResponse({ description: 'User or room not found' })
  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Body() createReservationDto: CreateReservationDto,
    @Request()
    req: AuthenticatedRequest,
  ) {
    return this.reservationsService.create(
      createReservationDto,
      req.user.userId,
    );
  }

  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get my reservations',
  })
  @ApiOkResponse({
    description: 'List of reservations for the authenticated user',
    type: ReservationResponseDto,
    isArray: true,
  })
  @ApiUnauthorizedResponse({ description: 'Missing, invalid or expired JWT' })
  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMyReservations(
    @Request()
    req: AuthenticatedRequest,
  ) {
    return this.reservationsService.findMyReservations(req.user.userId);
  }

  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Delete a reservation',
  })
  @ApiParam({
    name: 'id',
    description: 'Reservation UUID',
    type: String,
    format: 'uuid',
  })
  @ApiBadRequestResponse({ description: 'Invalid reservation UUID' })
  @ApiOkResponse({
    description: 'Reservation deleted successfully; empty response body',
  })
  @ApiUnauthorizedResponse({ description: 'Missing, invalid or expired JWT' })
  @ApiForbiddenResponse({
    description:
      'The authenticated user is neither the owner nor an administrator',
  })
  @ApiNotFoundResponse({ description: 'Reservation not found' })
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(
    @Param('id', ParseUUIDPipe) reservationId: string,
    @Request()
    req: AuthenticatedRequest,
  ) {
    return this.reservationsService.remove(
      reservationId,
      req.user.userId,
      req.user.role,
    );
  }
}
