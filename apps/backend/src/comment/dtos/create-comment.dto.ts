import { IsString, IsNotEmpty, MaxLength, IsUUID, IsEnum, IsOptional } from 'class-validator';
import { CommentableType } from '../entities/comment.entity';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  content: string;

  @IsEnum(CommentableType)
  commentableType: CommentableType;

  @IsUUID()
  commentableId: string;

  @IsUUID()
  @IsOptional()
  parentCommentId?: string;
}