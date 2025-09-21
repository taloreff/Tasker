// user.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  create(dto: CreateUserDto) {
    const user = this.userRepo.create({
      name: dto.name,
      email: dto.email,
      passwordHash: dto.password, // gets hashed in entity hook
    });
    return this.userRepo.save(user);
  }

  findAll() {
    return this.userRepo.find();
  }

  async findOne(id: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({ 
      where: { email },
      select: ['id', 'email', 'name', 'passwordHash', 'createdAt', 'updatedAt', 'roles']
    });
  }  

  async update(id: string, dto: UpdateUserDto) {
    await this.findOne(id); // ensure exists
    await this.userRepo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.userRepo.softDelete(id);
    return { deleted: true };
  }
}
