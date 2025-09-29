import { IsEnum, IsUUID, IsOptional } from 'class-validator';
import { WorkspaceMemberRole } from '../../user/entities/workspace-member.entity';

export class AddWorkspaceMemberDto {
  @IsUUID()
  userId: string;

  @IsEnum(WorkspaceMemberRole)
  @IsOptional()
  role?: WorkspaceMemberRole = WorkspaceMemberRole.MEMBER;
}