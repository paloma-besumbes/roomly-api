import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { MaxUtf8ByteLength } from '../validation/max-utf8-byte-length.validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'john@example.com',
    description: 'User email address',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'secret123',
    description:
      'Password with at least 8 characters and at most 72 UTF-8 bytes',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  @MaxUtf8ByteLength(72)
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
