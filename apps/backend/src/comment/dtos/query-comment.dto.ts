import { IsEnum, IsUUID, IsOptional, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { CommentableType } from '../entities/comment.entity';

export class QueryCommentDto {
  @IsEnum(CommentableType)
  @IsOptional()
  commentableType?: CommentableType;

  @IsUUID()
  @IsOptional()
  commentableId?: string;

  @IsUUID()
  @IsOptional()
  parentCommentId?: string;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  includeReplies?: boolean = true;
}