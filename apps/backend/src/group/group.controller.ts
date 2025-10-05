import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { GroupService } from './group.service';
import { UpdateGroupDto } from './dtos/update-group.dto';
import { CreateGroupDto } from './dtos/create-group.dto';

@Controller('groups')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Get()
  findByBoard(@Query('boardId') boardId: string) {
    return this.groupService.findByBoard(boardId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.groupService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateGroupDto) {
    return this.groupService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateGroupDto) {
    return this.groupService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.groupService.softDelete(id);
  }

  @Post('reorder')
  reorder(
    @Query('boardId') boardId: string,
    @Body() body: { groups: { id: string; position: number }[] },
  ) {
    return this.groupService.reorder(boardId, body.groups);
  }
}
