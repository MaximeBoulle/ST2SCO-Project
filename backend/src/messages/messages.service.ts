import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { Message } from './message.entity';
import { User } from '../users/user.entity';
import { MessagesGateway } from './messages.gateway';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    private messagesGateway: MessagesGateway,
  ) {}

  async create(content: string, user: User) {
    const message = this.messageRepository.create({ content, user });
    const saved = await this.messageRepository.save(message);
    const hydrated = await this.messageRepository.findOne({
      where: { id: saved.id },
      relations: ['user'],
    });
    if (hydrated) {
      this.messagesGateway.emitNewMessage(hydrated);
      return hydrated;
    }
    return saved;
  }

  async findAll(search?: string) {
    const where: FindOptionsWhere<Message> = {};
    if (search) {
      where.content = Like(`%${search}%`);
    }

    return this.messageRepository.find({
      where,
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async remove(id: string) {
    const message = await this.messageRepository.findOne({ where: { id } });
    if (!message) {
      throw new Error('Message not found');
    }
    await this.messageRepository.remove(message);
    return { deleted: true };
  }
}
