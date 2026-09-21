import { ApiProperty } from '@nestjs/swagger';

export class RoomResponseDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Room identifier',
    format: 'uuid',
  })
  id!: string;

  @ApiProperty({ example: 'Study Room A', description: 'Room name' })
  name!: string;

  @ApiProperty({
    example: 'Quiet room for individual or group study',
    description: 'Room description',
  })
  description!: string;

  @ApiProperty({
    type: 'integer',
    example: 8,
    description: 'Maximum room capacity',
  })
  capacity!: number;

  @ApiProperty({
    example: true,
    description: 'Whether the room has a projector',
  })
  hasProjector!: boolean;

  @ApiProperty({
    example: true,
    description: 'Whether the room has a whiteboard',
  })
  hasWhiteboard!: boolean;

  @ApiProperty({
    example: '2026-08-01T15:30:00.000Z',
    description: 'Room creation date',
    format: 'date-time',
  })
  createdAt!: Date;
}
