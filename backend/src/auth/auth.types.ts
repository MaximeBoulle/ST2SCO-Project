import { Request } from 'express';
import { UserRole } from '../users/user.entity';

export type AuthUser = {
  userId: string;
  username: string;
  role: UserRole;
  avatar?: string | null;
  banned?: boolean;
};

export type RequestWithUser = Request & { user: AuthUser };

export type RequestWithCookies = Request & { cookies?: Record<string, string> };

export type JwtPayload = {
  sub: string;
  username: string;
  role: UserRole;
  avatar?: string | null;
};

export type RegisterDto = {
  username: string;
  password: string;
  avatar?: string;
  role?: UserRole;
};

export type LoginDto = {
  username: string;
  password: string;
};
