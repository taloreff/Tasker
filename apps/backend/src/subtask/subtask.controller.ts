import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { SubtaskService } from './subtask.service';
import { CreateSubtaskDto } from './dtos/create-subtask.dto';
import { UpdateSubtaskDto } from './dtos/update-subtask.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('subtasks')
@UseGuards(JwtAuthGuard)
export class SubtaskController {
  constructor(private readonly subtaskService: SubtaskService) {}

  @Post()
  create(@Body() createSubtaskDto: CreateSubtaskDto, @Request() req) {
    return this.subtaskService.create(createSubtaskDto, req.user.id);
  }

  @Get()
  findAll(@Query('taskId') taskId: string, @Request() req) {
    if (taskId) {
      return this.subtaskService.findAllByTask(taskId, req.user.id);
    }
    return this.subtaskService.findUserSubtasks(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.subtaskService.findOne(id, req.user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSubtaskDto: UpdateSubtaskDto,
    @Request() req,
  ) {
    return this.subtaskService.update(id, updateSubtaskDto, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.subtaskService.remove(id, req.user.id);
  }

  @Post(':id/toggle')
  toggleComplete(@Param('id') id: string, @Request() req) {
    return this.subtaskService.toggleComplete(id, req.user.id);
  }

  @Post('reorder')
  reorderSubtasks(
    @Query('taskId') taskId: string,
    @Body('subtaskIds') subtaskIds: string[],
    @Request() req,
  ) {
    return this.subtaskService.reorderSubtasks(taskId, subtaskIds, req.user.id);
  }

  @Get('stats/:taskId')
  getCompletionStats(@Param('taskId') taskId: string, @Request() req) {
    return this.subtaskService.getTaskCompletionStats(taskId, req.user.id);
  }
}