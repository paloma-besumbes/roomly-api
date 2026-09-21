import { ConfigService } from '@nestjs/config';

import { UserRole } from '../../users/entities/user-role.enum';
import type { JwtPayload } from '../interfaces/jwt-payload.interface';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  it.each([UserRole.USER, UserRole.ADMIN])(
    'preserves the UUID subject and %s role in the authenticated user',
    (role) => {
      const strategy = new JwtStrategy(
        new ConfigService({ JWT_SECRET: 'test-secret' }),
      );
      const payload: JwtPayload = {
        sub: '550e8400-e29b-41d4-a716-446655440000',
        email: 'john@example.com',
        role,
      };

      const user: { userId: string; email: string; role: UserRole } =
        strategy.validate(payload);

      expect(user).toEqual({
        userId: payload.sub,
        email: payload.email,
        role,
      });
    },
  );
});
