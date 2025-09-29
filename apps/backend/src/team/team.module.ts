import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Team } from './entities/team.entity';
import { TeamService } from './team.service';
import { TeamController } from './team.controller';
import { WorkspaceModule } from '../workspace/workspace.module';
import { UserModule } from '../user/user.module';
import { UserTeamRole } from './entities/user_team_role.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Team, UserTeamRole]),
    forwardRef(() => WorkspaceModule),
    UserModule,
  ],
  controllers: [TeamController],
  providers: [TeamService],
  exports: [TeamService],
})
export class TeamModule {}