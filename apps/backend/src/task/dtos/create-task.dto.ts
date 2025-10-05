import { IsString, IsNotEmpty, IsUUID, IsOptional, IsEnum, IsInt} from 'class-validator';
import { TaskStatus, TaskPriority } from '../entities/task.entity';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus = TaskStatus.TODO;

  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority = TaskPriority.MEDIUM;

  @IsUUID()
  boardId: string;

  @IsInt()
  @IsOptional()
  position?: number;

  @IsUUID()
  @IsOptional()
  assigneeId?: string;
}
