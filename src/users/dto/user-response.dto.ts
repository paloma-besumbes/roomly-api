import { ApiProperty } from '@nestjs/swagger';

import { UserRole } from '../entities/user-role.enum';

export class UserResponseDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Unique user identifier',
  })
  id!: string;

  @ApiProperty({
    example: 'john@example.com',
    description: 'User email',
  })
  email!: string;

  @ApiProperty({
    example: 'John',
    description: 'User first name',
  })
  firstName!: string;

  @ApiProperty({
    example: 'Doe',
    description: 'User last name',
  })
  lastName!: string;

  @ApiProperty({
    enum: UserRole,
    example: UserRole.USER,
    description: 'User role',
  })
  role!: UserRole;

  @ApiProperty({
    example: '2026-07-30T09:15:00.000Z',
    description: 'Creation date',
  })
  createdAt!: Date;

  @ApiProperty({
    example: '2026-07-30T10:30:00.000Z',
    description: 'Last update date',
  })
  updatedAt!: Date;
}
