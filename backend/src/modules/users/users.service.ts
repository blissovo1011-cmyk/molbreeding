import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      select: ['id', 'username', 'name', 'email', 'role', 'status', 'department', 'createdAt'],
    });
  }

  async findOne(id: string): Promise<User> {
    return this.userRepository.findOne({
      where: { id },
      select: ['id', 'username', 'name', 'email', 'role', 'status', 'department', 'createdAt'],
    });
  }
}
