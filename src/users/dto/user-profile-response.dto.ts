import { ApiProperty } from '@nestjs/swagger';

import { UserRole } from '../entities/user-role.enum';
import type { AuthenticatedUser } from '../../auth/interfaces/authenticated-request.interface';

export class UserProfileResponseDto implements AuthenticatedUser {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'User identifier from the JWT subject',
    format: 'uuid',
  })
  userId!: string;

  @ApiProperty({
    example: 'john@example.com',
    description: 'User email from the JWT',
  })
  email!: string;

  @ApiProperty({
    enum: UserRole,
    example: UserRole.USER,
    description: 'User role from the JWT',
  })
  role!: UserRole;
}
