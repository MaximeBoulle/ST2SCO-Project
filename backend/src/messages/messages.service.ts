import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Message, MessagePriority } from './message.entity';
import { User } from '../users/user.entity';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {}

  async create(content: string, priority: MessagePriority, user: User) {
    const message = this.messageRepository.create({ content, priority, user });
    return this.messageRepository.save(message);
  }

  async findAll(search?: string, priority?: MessagePriority) {
    const where: any = {};
    if (search) {
      where.content = Like(`%${search}%`);
    }
    if (priority) {
      where.priority = priority;
    }
    return this.messageRepository.find({
      where,
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }
}
