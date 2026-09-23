import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';
import {
  IsReservationDateTime,
  RESERVATION_DATE_TIME_FORMAT,
  RESERVATION_DATE_TIME_PATTERN,
} from '../validation/reservation-date-time.validator';

export class CreateReservationDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Room identifier',
    format: 'uuid',
  })
  @IsUUID()
  roomId!: string;

  @ApiProperty({
    example: '2026-08-10T09:00:00.000Z',
    description: `Reservation start: ${RESERVATION_DATE_TIME_FORMAT}`,
    format: 'date-time',
    pattern: RESERVATION_DATE_TIME_PATTERN.source,
  })
  @IsReservationDateTime()
  startTime!: string;

  @ApiProperty({
    example: '2026-08-10T11:00:00.000Z',
    description: `Reservation end: ${RESERVATION_DATE_TIME_FORMAT}`,
    format: 'date-time',
    pattern: RESERVATION_DATE_TIME_PATTERN.source,
  })
  @IsReservationDateTime()
  endTime!: string;
}
