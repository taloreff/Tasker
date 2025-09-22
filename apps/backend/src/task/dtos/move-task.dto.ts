import { IsUUID, IsInt, Min, IsOptional } from 'class-validator';

export class MoveTaskDto {
  @IsUUID()
  columnId: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  position?: number = 0;
}