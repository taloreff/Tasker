import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { DatabaseModule } from './db/db.module';
import { AuthModule } from './auth/auth.module';
import { WorkspaceModule } from './workspace/workspace.module';
import { LoggerModule } from 'nestjs-pino';
import { TeamModule } from './team/team.module';
import { BoardModule } from './board/board.module';
import { TaskModule } from './task/task.module';
import { SubtaskModule } from './subtask/subtask.module';
import { LabelModule } from './label/label.module';
import { CommentModule } from './comment/comment.module';
import { GroupModule } from './group/group.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: 'apps/backend/.env' }),
    LoggerModule.forRoot({
      pinoHttp: {
        transport: process.env.NODE_ENV !== 'production'
          ? { target: 'pino-pretty', options: { singleLine: true } }
          : undefined,
      },
    }),
    DatabaseModule,
    UserModule,
    AuthModule,
    WorkspaceModule,
    TeamModule,
    BoardModule,
    GroupModule,
    TaskModule,
    SubtaskModule,
    LabelModule,
    CommentModule
  ] 
})
export class AppModule {}
