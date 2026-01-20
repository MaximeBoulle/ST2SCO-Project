import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Patch,
  Param,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User, UserRole } from './user.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import * as bcrypt from 'bcrypt';
import type { RequestWithUser } from '../auth/auth.types';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  private sanitizeUser(user: User) {
    const { password, ...result } = user;
    void password;
    return result;
  }

  @Post()
  @Roles(UserRole.ADMIN)
  async create(@Body() body: Partial<User>) {
    if (body.password) {
      body.password = await bcrypt.hash(body.password, 10);
    }
    const user = await this.usersService.create(body);
    return this.sanitizeUser(user);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  async findAll() {
    const users = await this.usersService.findAll();
    return users.map((user) => this.sanitizeUser(user));
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: Partial<User>,
    @Request() req: RequestWithUser,
  ) {
    const user = req.user;
    // user.userId comes from JwtStrategy.
    // If Admin, ok. If User, id must match userId.
    if (user.role !== UserRole.ADMIN && user.userId !== id) {
      throw new ForbiddenException('You can only update your own profile');
    }

    if (body.password) {
      body.password = await bcrypt.hash(body.password, 10);
    }

    // If User tries to change role?
    if (user.role !== UserRole.ADMIN && body.role && body.role !== user.role) {
      throw new ForbiddenException('You cannot change your role');
    }

    const updated = await this.usersService.update(id, body);
    return this.sanitizeUser(updated);
  }

  @Patch(':id/ban')
  @Roles(UserRole.ADMIN)
  async banUser(@Param('id') id: string, @Body() body: { banned: boolean }) {
    const updated = await this.usersService.update(id, { banned: body.banned });
    return this.sanitizeUser(updated);
  }
}
