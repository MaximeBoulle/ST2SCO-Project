import { Controller, Get, Post, Body, Query, UseGuards, Request } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MessagePriority } from './message.entity';
import { User } from '../users/user.entity';

@Controller('messages')
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() body, @Request() req) {
    // req.user comes from JwtStrategy and has { userId, username, role }
    // We map it to a partial User entity with id
    const user = { id: req.user.userId } as User;
    return this.messagesService.create(body.content, body.priority, user);
  }

  @Get()
  findAll(
    @Query('search') search: string,
    @Query('priority') priority: MessagePriority,
  ) {
    return this.messagesService.findAll(search, priority);
  }
}
