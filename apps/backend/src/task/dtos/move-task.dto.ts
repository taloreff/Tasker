import { IsUUID, IsInt, Min, IsOptional } from 'class-validator';

export class MoveTaskDto {
  @IsUUID()
  groupId: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  position?: number = 0;

  // Backward compatibility
  @IsUUID()
  @IsOptional()
  columnId?: string;
}