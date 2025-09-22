import { IsString, IsNotEmpty, MaxLength, IsUUID, IsOptional } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  workspaceId: string;
}