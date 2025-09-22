import { IsArray, IsUUID } from 'class-validator';

export class AssignLabelsDto {
  @IsArray()
  @IsUUID(4, { each: true })
  labelIds: string[];
}