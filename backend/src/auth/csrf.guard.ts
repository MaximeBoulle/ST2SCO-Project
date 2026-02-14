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

    // TEMPORARY DEBUG LOGGING
    console.log('=== CSRF DEBUG ===');
    console.log('Method:', request.method);
    console.log('URL:', request.url);
    console.log('All cookies:', request.cookies);
    console.log('Cookie Token:', cookieToken ? 'EXISTS (len=' + cookieToken.length + ')' : 'MISSING');
    console.log('Header Token:', headerToken ? 'EXISTS (len=' + headerToken.length + ')' : 'MISSING');
    console.log('All headers:', JSON.stringify({
      cookie: request.headers.cookie,
      'x-xsrf-token': request.headers['x-xsrf-token'],
      host: request.headers.host,
      'x-forwarded-proto': request.headers['x-forwarded-proto'],
      'x-forwarded-host': request.headers['x-forwarded-host'],
    }, null, 2));
    console.log('==================');

    if (!cookieToken || !headerToken) {
      console.error('CSRF FAIL: cookieToken=' + !!cookieToken + ', headerToken=' + !!headerToken);
      throw new ForbiddenException('CSRF token missing');
    }

    if (cookieToken !== headerToken) {
      console.error('CSRF FAIL: Token mismatch');
      throw new ForbiddenException('CSRF token mismatch');
    }

    console.log('CSRF OK');
    return true;
  }
}
