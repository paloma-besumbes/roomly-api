import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateRoomDto {
  @ApiProperty({
    example: 'Study Room A',
    description: 'Room name',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    example: 'Quiet room for individual or group study',
    description: 'Room description',
  })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({
    example: 8,
    description: 'Maximum room capacity',
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  capacity!: number;

  @ApiProperty({
    example: true,
    description: 'Whether the room has a projector',
  })
  @IsBoolean()
  hasProjector!: boolean;

  @ApiProperty({
    example: true,
    description: 'Whether the room has a whiteboard',
  })
  @IsBoolean()
  hasWhiteboard!: boolean;
}
