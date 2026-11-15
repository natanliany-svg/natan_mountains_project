import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { UserRole } from '../entities/user.entity.js';

// (#23)
@Injectable()
export class AdminGuard implements CanActivate {
  // (#23)
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Access denied: Admins only');
    }

    return true;
  }
}
