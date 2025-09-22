import { IsArray, IsInt, IsUUID, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class BoardPositionDto {
  @IsUUID()
  id: string;

  @IsInt()
  @Min(0)
  position: number;
}

export class ReorderBoardsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BoardPositionDto)
  boards: BoardPositionDto[];
}