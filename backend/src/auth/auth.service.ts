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

  async validateUser(
    username: string,
    pass: string,
  ): Promise<{ user: AuthUser | null; error?: string }> {
    const user = await this.usersService.findOne(username);

    // VULNERABLE: User enumeration - different error messages reveal user existence
    if (!user) {
      return { user: null, error: 'User not found' };
    }

    if (user.banned) {
      return { user: null, error: 'User is banned' };
    }

    if (!(await bcrypt.compare(pass, user.password))) {
      return { user: null, error: 'Incorrect password' };
    }

    return {
      user: {
        userId: user.id,
        username: user.username,
        role: user.role,
        avatar: user.avatar,
        banned: user.banned,
      },
    };
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
    // VULNERABLE: User enumeration - reveals if username exists
    const existingUser = await this.usersService.findOne(user.username);
    if (existingUser) {
      throw new Error('Username already taken');
    }

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
