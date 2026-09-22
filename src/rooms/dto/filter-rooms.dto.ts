import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, Min } from 'class-validator';

export class FilterRoomsDto {
  @ApiPropertyOptional({
    example: 8,
    description: 'Minimum room capacity',
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  capacity?: number;

  @ApiPropertyOptional({
    example: 'true',
    enum: ['true', 'false'],
    description:
      'Use true for rooms with a projector, false for rooms without one',
  })
  @IsOptional()
  @IsIn(['true', 'false'])
  hasProjector?: string;

  @ApiPropertyOptional({
    example: 'true',
    enum: ['true', 'false'],
    description:
      'Use true for rooms with a whiteboard, false for rooms without one',
  })
  @IsOptional()
  @IsIn(['true', 'false'])
  hasWhiteboard?: string;
}
