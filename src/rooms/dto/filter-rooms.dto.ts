import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBooleanString, IsInt, IsOptional, Min } from 'class-validator';

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
    description: 'Filter rooms with a projector',
  })
  @IsOptional()
  @IsBooleanString()
  hasProjector?: string;

  @ApiPropertyOptional({
    example: 'true',
    description: 'Filter rooms with a whiteboard',
  })
  @IsOptional()
  @IsBooleanString()
  hasWhiteboard?: string;
}
