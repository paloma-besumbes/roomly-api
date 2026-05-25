import { IsBoolean, IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateRoomDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsInt()
  @Min(1)
  capacity!: number;

  @IsBoolean()
  hasProjector!: boolean;

  @IsBoolean()
  hasWhiteboard!: boolean;
}
