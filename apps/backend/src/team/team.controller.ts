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
  Query,
} from '@nestjs/common';
import { TeamService } from './team.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreateTeamDto } from './dtos/create-team.dto';
import { UpdateTeamDto } from './dtos/update-team.dto';
import { AddTeamMemberDto } from './dtos/add-team-member.dto';

@Controller('teams')
@UseGuards(JwtAuthGuard)
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Post()
  create(@Body() createTeamDto: CreateTeamDto, @Request() req) {
    return this.teamService.create(createTeamDto, req.user.id);
  }

  @Get()
  findAllByWorkspace(@Query('workspaceId') workspaceId: string, @Request() req) {
    return this.teamService.findAllByWorkspace(workspaceId, req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.teamService.findOne(id, req.user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTeamDto: UpdateTeamDto,
    @Request() req,
  ) {
    return this.teamService.update(id, updateTeamDto, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.teamService.remove(id, req.user.id);
  }

  @Post(':id/members')
  addMember(
    @Param('id') id: string,
    @Body() addMemberDto: AddTeamMemberDto,
    @Request() req,
  ) {
    return this.teamService.addMember(id, addMemberDto, req.user.id);
  }

  @Delete(':id/members/:userId')
  removeMember(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Request() req,
  ) {
    return this.teamService.removeMember(id, userId, req.user.id);
  }

  @Get(':id/members')
  getMembers(@Param('id') id: string, @Request() req) {
    return this.teamService.getTeamMembers(id, req.user.id);
  }
}