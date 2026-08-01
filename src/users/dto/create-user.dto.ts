import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'john@example.com',
    description: 'User email address',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'secret123',
    description: 'Password with at least 8 characters',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({
    example: 'John',
    description: 'User first name',
    minLength: 2,
  })
  @IsString()
  @MinLength(2)
  firstName!: string;

  @ApiProperty({
    example: 'Doe',
    description: 'User last name',
    minLength: 2,
  })
  @IsString()
  @MinLength(2)
  lastName!: string;
}
