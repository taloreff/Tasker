import { IsString, IsNotEmpty, MaxLength, IsUUID, IsOptional, IsBoolean, IsInt, Min } from 'class-validator';

export class CreateSubtaskDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  completed?: boolean = false;

  @IsUUID()
  itemId: string;

  @IsUUID()
  @IsOptional()
  assigneeId?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  position?: number = 0;

  @IsString()
  @IsOptional()
  title?: string;

  @IsUUID()
  @IsOptional()
  taskId?: string;
}