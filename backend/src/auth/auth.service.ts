import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { User, UserRole } from '../users/user.entity';
import { AuthUser } from './auth.types';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<AuthUser | null> {
    const user = await this.usersService.findOne(username);
    if (user?.banned) {
      return null;
    }
    if (user && (await bcrypt.compare(pass, user.password))) {
      return {
        userId: user.id,
        username: user.username,
        role: user.role,
        avatar: user.avatar,
        banned: user.banned,
      };
    }
    return null;
  }

  login(user: AuthUser) {
    const payload = {
      username: user.username,
      sub: user.userId,
      role: user.role,
      avatar: user.avatar,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(
    user: Pick<User, 'username' | 'password'> &
      Partial<Pick<User, 'avatar' | 'role'>>,
  ) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const avatar =
      user.avatar ||
      `https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.username}`;
    return this.usersService.create({
      ...user,
      password: hashedPassword,
      avatar,
      role: user.role || UserRole.USER,
    });
  }
}
