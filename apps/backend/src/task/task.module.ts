import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoardItem } from './entities/task.entity';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { ColumnModule } from '../column/column.module';
import { BoardModule } from '../board/board.module';
import { UserModule } from '../user/user.module';
import { WorkspaceModule } from '../workspace/workspace.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([BoardItem]),
    ColumnModule,
    BoardModule,
    UserModule,
    WorkspaceModule,
  ],
  controllers: [TaskController],
  providers: [TaskService],
  exports: [TaskService],
})
export class TaskModule {}