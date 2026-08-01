import { ApiProperty } from '@nestjs/swagger';

export class ReservationResponseDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Reservation identifier',
    format: 'uuid',
  })
  id!: string;

  @ApiProperty({
    example: '2026-08-10T09:00:00.000Z',
    description: 'Reservation start time',
    format: 'date-time',
  })
  startTime!: Date;

  @ApiProperty({
    example: '2026-08-10T11:00:00.000Z',
    description: 'Reservation end time',
    format: 'date-time',
  })
  endTime!: Date;

  @ApiProperty({
    example: '2026-08-01T15:30:00.000Z',
    description: 'Reservation creation date',
    format: 'date-time',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Reserved room',
    example: {
      id: 'room-1',
      name: 'Study Room A',
      description: 'Quiet room for study',
      capacity: 8,
      hasProjector: true,
      hasWhiteboard: true,
    },
  })
  room!: {
    id: string;
    name: string;
    description: string;
    capacity: number;
    hasProjector: boolean;
    hasWhiteboard: boolean;
  };

  @ApiProperty({
    description: 'User who created the reservation',
    example: {
      id: 'user-1',
      email: 'john@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'USER',
    },
  })
  user!: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}
