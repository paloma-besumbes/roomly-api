import { ApiProperty, PickType } from '@nestjs/swagger';

import { RoomResponseDto } from '../../rooms/dto/room-response.dto';
import { UserResponseDto } from '../../users/dto/user-response.dto';

export class ReservationRoomResponseDto extends PickType(RoomResponseDto, [
  'id',
  'name',
  'description',
  'capacity',
  'hasProjector',
  'hasWhiteboard',
] as const) {}

export class ReservationUserResponseDto extends PickType(UserResponseDto, [
  'id',
  'email',
  'firstName',
  'lastName',
  'role',
] as const) {}

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
    type: ReservationRoomResponseDto,
    example: {
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Study Room A',
      description: 'Quiet room for study',
      capacity: 8,
      hasProjector: true,
      hasWhiteboard: true,
    },
  })
  room!: ReservationRoomResponseDto;

  @ApiProperty({
    description: 'User who created the reservation',
    type: ReservationUserResponseDto,
    example: {
      id: '550e8400-e29b-41d4-a716-446655440001',
      email: 'john@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'USER',
    },
  })
  user!: ReservationUserResponseDto;
}
