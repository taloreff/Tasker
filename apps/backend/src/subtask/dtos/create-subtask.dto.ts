import { IsString, IsNotEmpty, MaxLength, IsUUID, IsOptional, IsBoolean, IsInt, Min } from 'class-validator';

export class CreateSubtaskDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  completed?: boolean = false;

  @IsUUID()
  taskId: string;

  @IsUUID()
  @IsOptional()
  assignedToId?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  position?: number = 0;
}