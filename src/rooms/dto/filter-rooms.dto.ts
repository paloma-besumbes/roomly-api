import { IsBooleanString, IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterRoomsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  capacity?: number;

  @IsOptional()
  @IsBooleanString()
  hasProjector?: string;

  @IsOptional()
  @IsBooleanString()
  hasWhiteboard?: string;
}
