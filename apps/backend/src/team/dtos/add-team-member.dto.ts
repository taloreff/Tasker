import { IsUUID, IsEnum, IsOptional } from 'class-validator';
import { TeamRole } from '../entities/user_team_role.entity';

export class AddTeamMemberDto {
  @IsUUID()
  userId: string;

  @IsEnum(TeamRole)
  @IsOptional()
  role?: TeamRole = TeamRole.TEAM_MEMBER;
}