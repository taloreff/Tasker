import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { AddWorkspaceMemberDto } from './dto/add-workspace-member.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { TeamService } from '../team/team.service';
import { CreateTeamDto } from '../team/dtos/create-team.dto';
import { CreateWorkspaceTeamDto } from './dto/create-workspace-team.dto';

@Controller('workspaces')
@UseGuards(JwtAuthGuard)
export class WorkspaceController {
  constructor(
    private readonly workspaceService: WorkspaceService,
    private readonly teamService: TeamService,
  ) {}

  @Post()
  create(@Body() createWorkspaceDto: CreateWorkspaceDto, @Request() req) {
    return this.workspaceService.create(createWorkspaceDto, req.user.id);
  }

  @Get()
  findAll(@Request() req) {
    return this.workspaceService.findUserWorkspaces(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.workspaceService.findOne(id, req.user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateWorkspaceDto: UpdateWorkspaceDto,
    @Request() req,
  ) {
    return this.workspaceService.update(id, updateWorkspaceDto, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.workspaceService.remove(id, req.user.id);
  }

  @Post(':id/members')
  addMember(
    @Param('id') workspaceId: string,
    @Body() addMemberDto: AddWorkspaceMemberDto,
  ) {
    return this.workspaceService.addMember(
      workspaceId,
      addMemberDto.userId,
      addMemberDto.role,
    );
  }

  @Delete(':id/members/:userId')
  removeMember(
    @Param('id') workspaceId: string,
    @Param('userId') userId: string,
    @Request() req,
  ) {
    return this.workspaceService.removeMember(workspaceId, userId, req.user.id);
  }

  @Get(':id/teams')
  getWorkspaceTeams(@Param('id') workspaceId: string, @Request() req) {
    return this.teamService.findAllByWorkspace(workspaceId, req.user.id);
  }

  @Post(':id/teams')
  createWorkspaceTeam(
    @Param('id') workspaceId: string,
    @Body() createWorkspaceTeamDto: CreateWorkspaceTeamDto,
    @Request() req,
  ) {
    const createTeamDto: CreateTeamDto = {
      ...createWorkspaceTeamDto,
      workspaceId,
    };
    return this.teamService.create(createTeamDto, req.user.id);
  }
}