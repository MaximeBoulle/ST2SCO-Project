import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
  Delete,
  Param,
  ForbiddenException,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CsrfGuard } from '../auth/csrf.guard';
import { UserRole } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import type { RequestWithUser } from '../auth/auth.types';

@Controller('messages')
export class MessagesController {
  constructor(
    private messagesService: MessagesService,
    private usersService: UsersService,
  ) {}

  @UseGuards(JwtAuthGuard, CsrfGuard)
  @Post()
  async create(
    @Body() body: { content: string },
    @Request() req: RequestWithUser,
  ) {
    // req.user comes from JwtStrategy and has { userId, username, role }
    // We map it to a partial User entity with id
    const user = await this.usersService.findById(req.user.userId);
    if (!user || user.banned) {
      throw new ForbiddenException('User is banned');
    }
    return this.messagesService.create(body.content, user);
  }

  @Get()
  findAll(@Query('search') search: string) {
    return this.messagesService.findAll(search);
  }

  @UseGuards(JwtAuthGuard, RolesGuard, CsrfGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.messagesService.remove(id);
  }
}
