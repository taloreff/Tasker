import { IsString, IsNotEmpty, MaxLength, IsUUID, IsOptional, IsEnum, IsInt, Min, IsNumber, IsArray, IsISO8601 } from 'class-validator';
import { ItemStatus, ItemPriority } from '../entities/task.entity';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(ItemStatus)
  @IsOptional()
  status?: ItemStatus = ItemStatus.TODO;

  @IsEnum(ItemPriority)
  @IsOptional()
  priority?: ItemPriority = ItemPriority.MEDIUM;

  @IsISO8601({ strict: false })
  @IsOptional()
  dueDate?: string;

  @IsUUID()
  groupId: string;

  @IsUUID()
  boardId: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  position?: number = 0;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  estimatedHours?: number;

  @IsUUID()
  @IsOptional()
  assigneeId?: string;

  // Backward compatibility properties
  @IsString()
  @IsOptional()
  title?: string;

  @IsUUID()
  @IsOptional()
  columnId?: string;

  @IsArray()
  @IsUUID(4, { each: true })
  @IsOptional()
  assigneeIds?: string[] = [];
}