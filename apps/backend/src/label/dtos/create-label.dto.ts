import { IsString, IsNotEmpty, MaxLength, IsUUID, IsOptional, Matches } from 'class-validator';

export class CreateLabelDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  description?: string;

  @IsString()
  @Matches(/^#[0-9A-F]{6}$/i, { 
    message: 'Color must be a valid hex color code' 
  })
  color: string;

  @IsUUID()
  workspaceId: string;
}