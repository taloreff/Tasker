import { IsString, IsNotEmpty, MaxLength, IsUUID, IsOptional, IsEnum, IsInt, Min, IsNumber, IsArray, IsISO8601 } from 'class-validator';
import { TaskStatus, TaskPriority } from '../entities/task.entity';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus = TaskStatus.TODO;

  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority = TaskPriority.MEDIUM;

  @IsISO8601({ strict: false })
  @IsOptional()
  dueDate?: string;

  @IsUUID()
  columnId: string;

  @IsUUID()
  boardId: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  position?: number = 0;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  estimatedHours?: number;

  @IsArray()
  @IsUUID(4, { each: true })
  @IsOptional()
  assigneeIds?: string[] = [];
}