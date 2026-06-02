import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserNotFoundError } from '../common/errors/user-not-found.error';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private readonly repo: Repository<User>) {}

  findAll(): Promise<User[]> {
    return this.repo.find({ order: { name: 'ASC' } });
  }

  async findOneOrThrow(id: string): Promise<User> {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new UserNotFoundError(id);
    return user;
  }
}
