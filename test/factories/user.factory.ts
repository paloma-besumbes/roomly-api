import { User } from '../../src/users/entities/user.entity';
import { UserRole } from '../../src/users/entities/user-role.enum';

export function createMockUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-1',
    email: 'john@example.com',
    password: 'hashed-password',
    firstName: 'John',
    lastName: 'Doe',
    role: UserRole.USER,
    createdAt: new Date(),
    updatedAt: new Date(),

    ...overrides,
  };
}
