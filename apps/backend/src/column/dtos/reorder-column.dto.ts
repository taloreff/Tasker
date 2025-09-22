import { IsArray, IsUUID, ValidateNested, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

class ColumnPositionDto {
  @IsUUID()
  id: string;

  @IsInt()
  @Min(0)
  position: number;
}

export class ReorderColumnsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ColumnPositionDto)
  columns: ColumnPositionDto[];
}