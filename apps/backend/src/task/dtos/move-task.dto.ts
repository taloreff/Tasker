import { IsUUID, IsNumber, IsOptional, Min } from 'class-validator';

export class MoveTaskDto {
  @IsUUID()
  @IsOptional()
  groupId?: string;

  @IsNumber()
  @Min(0)
  position: number;
}
