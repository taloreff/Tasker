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
import { BoardService } from './board.service';
import { CreateBoardDto } from './dtos/create-board.dto';
import { UpdateBoardDto } from './dtos/update-board.dto';
import { ReorderBoardsDto } from './dtos/reorder-board.dto'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';


@Controller('boards')
@UseGuards(JwtAuthGuard)
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @Post()
  create(@Body() createBoardDto: CreateBoardDto, @Request() req) {
    return this.boardService.create(createBoardDto, req.user.id);
  }

  @Get()
  findAll(@Query('projectId') projectId: string, @Request() req) {
    if (projectId) {
      return this.boardService.findAllByProject(projectId, req.user.id);
    }
    return this.boardService.findUserBoards(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.boardService.findOne(id, req.user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateBoardDto: UpdateBoardDto,
    @Request() req,
  ) {
    return this.boardService.update(id, updateBoardDto, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.boardService.remove(id, req.user.id);
  }

  @Post('reorder')
  reorderBoards(
    @Query('projectId') projectId: string,
    @Body() reorderDto: ReorderBoardsDto,
    @Request() req,
  ) {
    return this.boardService.reorderBoards(projectId, reorderDto, req.user.id);
  }
}