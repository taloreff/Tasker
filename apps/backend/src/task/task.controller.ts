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
import { TaskService } from './task.service';
import { CreateTaskDto } from './dtos/create-task.dto';
import { UpdateTaskDto } from './dtos/update-task.dto';
import { MoveTaskDto } from './dtos/move-task.dto';
import { AssignTaskDto } from './dtos/assign-task.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  create(@Body() createTaskDto: CreateTaskDto, @Request() req) {
    return this.taskService.create(createTaskDto, req.user.id);
  }

  @Get()
  findAll(
    @Query('boardId') boardId: string,
    @Query('columnId') columnId: string,
    @Request() req,
  ) {
    if (columnId) {
      return this.taskService.findAllByColumn(columnId, req.user.id);
    }
    if (boardId) {
      return this.taskService.findAllByBoard(boardId, req.user.id);
    }
    return this.taskService.findUserTasks(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.taskService.findOne(id, req.user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @Request() req,
  ) {
    return this.taskService.update(id, updateTaskDto, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.taskService.remove(id, req.user.id);
  }

  @Post(':id/move')
  moveTask(
    @Param('id') id: string,
    @Body() moveTaskDto: MoveTaskDto,
    @Request() req,
  ) {
    return this.taskService.moveTask(id, moveTaskDto, req.user.id);
  }

  @Post(':id/assign')
  assignTask(
    @Param('id') id: string,
    @Body() assignTaskDto: AssignTaskDto,
    @Request() req,
  ) {
    return this.taskService.assignTask(id, assignTaskDto, req.user.id);
  }
}