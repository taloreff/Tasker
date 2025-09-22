import { IsArray, IsUUID } from 'class-validator';

export class AssignTaskDto {
  @IsArray()
  @IsUUID(4, { each: true })
  assigneeIds: string[];
}