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
import { MessagePriority } from './message.entity';
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

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body() body: { content: string; priority?: MessagePriority },
    @Request() req: RequestWithUser,
  ) {
    // req.user comes from JwtStrategy and has { userId, username, role }
    // We map it to a partial User entity with id
    const user = await this.usersService.findById(req.user.userId);
    if (!user || user.banned) {
      throw new ForbiddenException('User is banned');
    }
    const priority = body.priority ?? MessagePriority.LOW;
    return this.messagesService.create(body.content, priority, user);
  }

  @Get()
  findAll(
    @Query('search') search: string,
    @Query('priority') priority: MessagePriority,
  ) {
    return this.messagesService.findAll(search, priority);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.messagesService.remove(id);
  }
}
