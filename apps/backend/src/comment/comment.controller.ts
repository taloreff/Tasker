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
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dtos/create-comment.dto';
import { UpdateCommentDto } from './dtos/update-comment.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { QueryCommentDto } from './dtos/query-comment.dto';

@Controller('comments')
@UseGuards(JwtAuthGuard)
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  create(@Body() createCommentDto: CreateCommentDto, @Request() req) {
    return this.commentService.create(createCommentDto, req.user.id);
  }

  @Get()
  findByEntity(@Query() queryDto: QueryCommentDto, @Request() req) {
    return this.commentService.findByEntity(queryDto, req.user.id);
  }

  @Get('user')
  findUserComments(@Request() req) {
    return this.commentService.findUserComments(req.user.id);
  }

  @Get('stats')
  getCommentStats(@Query() queryDto: QueryCommentDto, @Request() req) {
    return this.commentService.getCommentStats(
      queryDto.commentableType,
      queryDto.commentableId,
      req.user.id,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.commentService.findOne(id, req.user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @Request() req,
  ) {
    return this.commentService.update(id, updateCommentDto, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.commentService.remove(id, req.user.id);
  }
}