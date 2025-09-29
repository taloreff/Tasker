import { IsString, IsNotEmpty, MaxLength, IsUUID, IsOptional } from 'class-validator';

export class CreateBoardDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  workspaceId: string;

  @IsString()
  @IsOptional()
  color?: string;

  @IsUUID()
  @IsOptional()
  assignedTeamId?: string;

  @IsUUID()
  @IsOptional()
  projectId?: string;
}