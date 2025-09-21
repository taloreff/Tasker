// user.service.ts
import { BadRequestException, Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async create(dto: CreateUserDto) {
    this.logger.log(`Creating user with email: ${dto.email}`);
    const existing = await this.userRepo.findOne({ where: { email: dto.email } });
    if (existing) {
      this.logger.warn(`Email already in use: ${dto.email}`);
      throw new BadRequestException('Email already in use');
    }
  
    const user = this.userRepo.create({
      name: dto.name,
      email: dto.email,
      passwordHash: dto.password,
    });
  
    const savedUser = await this.userRepo.save(user);
    this.logger.log(`User created successfully: ${savedUser.email} (ID: ${savedUser.id})`);
    return savedUser;
  }
  

  findAll() {
    return this.userRepo.find();
  }

  async findOne(id: string) {
    this.logger.log(`Finding user by ID: ${id}`);
    const user = await this.userRepo.findOne({ where: { id }, relations:['roles'] });
    if (!user) {
      this.logger.warn(`User not found: ${id}`);
      throw new NotFoundException(`User ${id} not found`);
    }
    this.logger.log(`User found: ${user.email} (ID: ${user.id})`);
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    this.logger.log(`Finding user by email: ${email}`);
    const user = await this.userRepo.findOne({ 
      where: { email },
      select: ['id', 'email', 'name', 'passwordHash', 'createdAt', 'updatedAt', 'roles']
    });
    if (user) {
      this.logger.log(`User found by email: ${email} (ID: ${user.id})`);
    } else {
      this.logger.log(`User not found by email: ${email}`);
    }
    return user;
  }  

  async update(id: string, dto: UpdateUserDto) {
    this.logger.log(`Updating user: ${id}`);
    await this.findOne(id); // ensure exists
    await this.userRepo.update(id, dto);
    this.logger.log(`User updated successfully: ${id}`);
    return this.findOne(id);
  }

  async remove(id: string) {
    this.logger.log(`Soft deleting user: ${id}`);
    await this.findOne(id);
    await this.userRepo.softDelete(id);
    this.logger.log(`User soft deleted successfully: ${id}`);
    return { deleted: true };
  }
}
