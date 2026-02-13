import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(private readonly usersService: UsersService) {}

  async onApplicationBootstrap() {
    await this.seedUsers();
  }

  private async seedUsers() {
    const demoUsers = [
      {
        username: 'admin',
        password: 'Admin123!',
        role: UserRole.ADMIN,
        avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=admin',
      },
      {
        username: 'user',
        password: 'User123!',
        role: UserRole.USER,
        avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=user',
      },
    ];

    for (const demo of demoUsers) {
      const existing = await this.usersService.findOne(demo.username);
      if (existing) {
        this.logger.log(`Demo account "${demo.username}" already exists, skipping.`);
        continue;
      }

      const hashedPassword = await bcrypt.hash(demo.password, 10);
      await this.usersService.create({
        username: demo.username,
        password: hashedPassword,
        role: demo.role,
        avatar: demo.avatar,
      });
      this.logger.log(`Demo account "${demo.username}" created (role: ${demo.role}).`);
    }
  }
}
