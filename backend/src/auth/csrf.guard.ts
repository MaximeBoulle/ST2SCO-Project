import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class CsrfGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    // Only validate state-changing methods
    const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
    if (safeMethods.includes(request.method.toUpperCase())) {
      return true;
    }

    const cookieToken: string | undefined = request.cookies?.['XSRF-TOKEN'] as
      | string
      | undefined;
    const headerToken = request.headers['x-xsrf-token'] as string;

    if (!cookieToken || !headerToken) {
      throw new ForbiddenException('CSRF token missing');
    }

    if (cookieToken !== headerToken) {
      throw new ForbiddenException('CSRF token mismatch');
    }

    return true;
  }
}
