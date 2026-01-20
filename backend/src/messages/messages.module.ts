import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { Message } from './message.entity';
import { UsersModule } from '../users/users.module';
import { MessagesGateway } from './messages.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([Message]), UsersModule],
  controllers: [MessagesController],
  providers: [MessagesService, MessagesGateway],
})
export class MessagesModule {}
