import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private dataSource: DataSource,
  ) {}

  async create(userData: Partial<User>): Promise<User> {
    const user = this.usersRepository.create(userData);
    return this.usersRepository.save(user);
  }

  async findOne(username: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { username } });
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async update(id: string, attrs: Partial<User>) {
    const user = await this.findById(id);
    if (!user) {
      throw new Error('User not found');
    }
    Object.assign(user, attrs);
    return this.usersRepository.save(user);
  }

  // VULNERABLE: SQL Injection 2nd Order
  // The username is stored in DB and later used in a raw SQL query
  // If an attacker sets their username to a SQL payload, it executes here
  async getUserStats(userId: string) {
    const user = await this.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Second-order SQL injection: username from DB is used directly in query
    const query = `
      SELECT
        COUNT(*) as message_count,
        MIN(m."createdAt") as first_message,
        MAX(m."createdAt") as last_message
      FROM message m
      JOIN "user" u ON m."userId" = u.id
      WHERE u.username = '${user.username}'
    `;

    const results: Record<string, unknown>[] =
      await this.dataSource.query(query);
    return {
      userId: user.id,
      username: user.username,
      stats: results[0],
    };
  }
}
