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
import { LabelService } from './label.service';
import { CreateLabelDto } from './dtos/create-label.dto';
import { UpdateLabelDto } from './dtos/update-label.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AssignLabelsDto } from './dtos/assign-label.dto';

@Controller('labels')
@UseGuards(JwtAuthGuard)
export class LabelController {
  constructor(private readonly labelService: LabelService) {}

  @Post()
  create(@Body() createLabelDto: CreateLabelDto, @Request() req) {
    return this.labelService.create(createLabelDto, req.user.id);
  }

  @Get()
  findAll(@Query('workspaceId') workspaceId: string, @Request() req) {
    if (workspaceId) {
      return this.labelService.findAllByWorkspace(workspaceId, req.user.id);
    }
    return this.labelService.findUserLabels(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.labelService.findOne(id, req.user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateLabelDto: UpdateLabelDto,
    @Request() req,
  ) {
    return this.labelService.update(id, updateLabelDto, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.labelService.remove(id, req.user.id);
  }

  @Post('assign/:taskId')
  assignLabelsToTask(
    @Param('taskId') taskId: string,
    @Body() assignLabelsDto: AssignLabelsDto,
    @Request() req,
  ) {
    return this.labelService.assignLabelsToTask(taskId, assignLabelsDto, req.user.id);
  }

  @Get('task/:taskId')
  findLabelsByTask(@Param('taskId') taskId: string, @Request() req) {
    return this.labelService.findLabelsByTask(taskId, req.user.id);
  }

  @Post('default')
  createDefaultLabels(@Query('workspaceId') workspaceId: string, @Request() req) {
    return this.labelService.createDefaultLabels(workspaceId, req.user.id);
  }
}