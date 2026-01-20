import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { AuthUser, JwtPayload, RequestWithCookies } from './auth.types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: RequestWithCookies) =>
          request?.cookies?.Authentication
            ? String(request.cookies.Authentication)
            : null,
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'secret',
    });
  }

  async validate(payload: JwtPayload): Promise<AuthUser> {
    const user = await this.usersService.findById(payload.sub);
    if (!user || user.banned) {
      throw new UnauthorizedException('User is banned or not found');
    }
    return {
      userId: user.id,
      username: user.username,
      role: user.role,
      avatar: user.avatar,
      banned: user.banned,
    };
  }
}
