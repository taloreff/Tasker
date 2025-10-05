import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, Length, IsHexColor } from 'class-validator';
import { GroupType } from '../entities/group.entity';

export class CreateGroupDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(GroupType)
  @IsOptional()
  groupType?: GroupType;

  @IsHexColor()
  @IsOptional()
  color?: string;

  @IsUUID()
  boardId: string;

  @IsOptional()
  position?: number;
}
