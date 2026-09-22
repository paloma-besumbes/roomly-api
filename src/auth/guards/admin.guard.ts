import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

import { UserRole } from '../../users/entities/user-role.enum';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{
      user?: { role: UserRole };
    }>();

    if (request.user?.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Administrator access required');
    }

    return true;
  }
}
