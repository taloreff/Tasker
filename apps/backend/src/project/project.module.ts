import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { WorkspaceModule } from '../workspace/workspace.module';
import { TeamModule } from '../team/team.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Project]),
    WorkspaceModule,
    TeamModule,
    UserModule,
  ],
  controllers: [ProjectController],
  providers: [ProjectService],
  exports: [ProjectService],
})
export class ProjectModule {}