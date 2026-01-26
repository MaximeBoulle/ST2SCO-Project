import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Message } from './message.entity';
import { User } from '../users/user.entity';
import { MessagesGateway } from './messages.gateway';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    private messagesGateway: MessagesGateway,
    private dataSource: DataSource,
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
    // VULNERABLE: SQL Injection via raw query
    // Safe version would use parameterized queries or TypeORM's Like()
    if (search) {
      const query = `
        SELECT m.*, u.id as "userId", u.username, u.avatar, u.role, u.banned
        FROM message m
        LEFT JOIN "user" u ON m."userId" = u.id
        WHERE m.content LIKE '%${search}%'
        ORDER BY m."createdAt" DESC
      `;
      const results: Record<string, unknown>[] =
        await this.dataSource.query(query);
      return results.map((row) => ({
        id: row.id as string,
        content: row.content as string,
        createdAt: row.createdAt as Date,
        user: row.userId
          ? {
              id: row.userId as string,
              username: row.username as string,
              avatar: row.avatar as string,
              role: row.role as string,
              banned: row.banned as boolean,
            }
          : null,
      }));
    }

    return this.messageRepository.find({
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
