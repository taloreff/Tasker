import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Group } from './entities/group.entity';
import { CreateGroupDto } from './dtos/create-group.dto';
import { UpdateGroupDto } from './dtos/update-group.dto';

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(Group)
    private readonly groupRepo: Repository<Group>,
  ) {}

  async findByBoard(boardId: string): Promise<Group[]> {
    return this.groupRepo.find({
      where: { boardId },
      order: { position: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Group> {
    const group = await this.groupRepo.findOne({ where: { id } });
    if (!group) throw new NotFoundException(`Group ${id} not found`);
    return group;
  }

  async create(dto: CreateGroupDto): Promise<Group> {
    const group = this.groupRepo.create({
      ...dto,
      position: dto.position ?? 0,
    });
    return this.groupRepo.save(group);
  }

  async update(id: string, dto: UpdateGroupDto): Promise<Group> {
    const group = await this.findOne(id);
    Object.assign(group, dto);
    return this.groupRepo.save(group);
  }

  async softDelete(id: string): Promise<void> {
    await this.findOne(id);
    await this.groupRepo.softDelete(id);
  }

  async reorder(boardId: string, groups: { id: string; position: number }[]) {
    for (const { id, position } of groups) {
      await this.groupRepo.update({ id, boardId }, { position });
    }
    return this.findByBoard(boardId);
  }
}
