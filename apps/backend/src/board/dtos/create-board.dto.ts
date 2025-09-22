import { IsString, IsNotEmpty, MaxLength, IsUUID, IsOptional, IsInt, Min } from 'class-validator';

export class CreateBoardDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  projectId: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  position?: number = 0;
}