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
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AssignTeamsDto, AssignMembersDto } from './dto/assign.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  create(@Body() createProjectDto: CreateProjectDto, @Request() req) {
    return this.projectService.create(createProjectDto, req.user.id);
  }

  @Get()
  findAll(@Request() req, @Query('workspaceId') workspaceId?: string) {
    if (workspaceId) {
      return this.projectService.findAllByWorkspace(workspaceId, req.user.id);
    }
    return this.projectService.getProjectsByUser(req.user.id);
  }

  @Get('my-projects')
  getMyProjects(@Request() req, @Query('workspaceId') workspaceId?: string) {
    return this.projectService.getProjectsByUser(req.user.id, workspaceId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.projectService.findOne(id, req.user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @Request() req,
  ) {
    return this.projectService.update(id, updateProjectDto, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.projectService.remove(id, req.user.id);
  }

  @Post(':id/teams')
  assignTeams(
    @Param('id') id: string,
    @Body() assignTeamsDto: AssignTeamsDto,
    @Request() req,
  ) {
    return this.projectService.assignTeams(id, assignTeamsDto, req.user.id);
  }

  @Post(':id/members')
  assignMembers(
    @Param('id') id: string,
    @Body() assignMembersDto: AssignMembersDto,
    @Request() req,
  ) {
    return this.projectService.assignMembers(id, assignMembersDto, req.user.id);
  }
}