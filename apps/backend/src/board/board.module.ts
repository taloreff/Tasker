import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board } from './entities/board.entity';
import { BoardView } from './entities/board-view.entity';
import { BoardService } from './board.service';
import { BoardController } from './board.controller';
import { WorkspaceModule } from '../workspace/workspace.module';
import { Group } from '../group/entities/group.entity';
import { Task } from './entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([Board, BoardView, Group, Task]),
    WorkspaceModule,
  ],
  controllers: [BoardController],
  providers: [BoardService],
  exports: [BoardService],
})
export class BoardModule {}