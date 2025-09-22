import { IsUUID, IsArray } from 'class-validator';

export class AssignTeamsDto {
  @IsArray()
  @IsUUID('4', { each: true })
  teamIds: string[];
}

export class AssignMembersDto {
  @IsArray()
  @IsUUID('4', { each: true })
  memberIds: string[];
}