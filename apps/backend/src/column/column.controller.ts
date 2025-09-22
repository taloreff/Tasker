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
import { ColumnService } from './column.service';
import { CreateColumnDto } from './dtos/create-column.dto';
import { UpdateColumnDto } from './dtos/update-column.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ReorderColumnsDto } from './dtos/reorder-column.dto';

@Controller('columns')
@UseGuards(JwtAuthGuard)
export class ColumnController {
  constructor(private readonly columnService: ColumnService) {}

  @Post()
  create(@Body() createColumnDto: CreateColumnDto, @Request() req) {
    return this.columnService.create(createColumnDto, req.user.id);
  }

  @Get()
  findAll(@Query('boardId') boardId: string, @Request() req) {
    if (boardId) {
      return this.columnService.findAllByBoard(boardId, req.user.id);
    }
    return this.columnService.findUserColumns(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.columnService.findOne(id, req.user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateColumnDto: UpdateColumnDto,
    @Request() req,
  ) {
    return this.columnService.update(id, updateColumnDto, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.columnService.remove(id, req.user.id);
  }

  @Post('reorder')
  reorderColumns(
    @Query('boardId') boardId: string,
    @Body() reorderDto: ReorderColumnsDto,
    @Request() req,
  ) {
    return this.columnService.reorderColumns(boardId, reorderDto, req.user.id);
  }

  @Post('default')
  createDefaultColumns(@Query('boardId') boardId: string, @Request() req) {
    return this.columnService.createDefaultColumns(boardId, req.user.id);
  }
}