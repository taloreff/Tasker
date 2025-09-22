import { IsString, IsNotEmpty, MaxLength, IsUUID, IsOptional, IsInt, Min, Matches } from 'class-validator';

export class CreateColumnDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsUUID()
  boardId: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  position?: number = 0;

  @IsString()
  @IsOptional()
  @Matches(/^#[0-9A-F]{6}$/i, { message: 'Color must be a valid hex color code.' })
  color?: string;
}