import { PartialType } from '@nestjs/mapped-types';
import { CreateTeamDto } from './create-team.dto';
import { OmitType } from '@nestjs/mapped-types';

export class UpdateTeamDto extends PartialType(
  OmitType(CreateTeamDto, ['workspaceId'] as const)
) {}