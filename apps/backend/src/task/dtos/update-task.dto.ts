import { IsString, IsOptional, IsEnum, IsInt, IsUUID } from 'class-validator';
import { TaskStatus, TaskPriority } from '../entities/task.entity';

export class UpdateTaskDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @IsInt()
  @IsOptional()
  position?: number;

  @IsUUID()
  @IsOptional()
  assigneeId?: string;
}
