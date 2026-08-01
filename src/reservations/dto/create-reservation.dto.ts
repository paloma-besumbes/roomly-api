import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsUUID } from 'class-validator';

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
    description: 'Reservation start date and time',
    format: 'date-time',
  })
  @IsDateString()
  startTime!: string;

  @ApiProperty({
    example: '2026-08-10T11:00:00.000Z',
    description: 'Reservation end date and time',
    format: 'date-time',
  })
  @IsDateString()
  endTime!: string;
}
