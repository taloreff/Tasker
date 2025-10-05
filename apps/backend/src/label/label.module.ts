import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Label } from './entities/label.entity';
import { LabelService } from './label.service';
import { LabelController } from './label.controller';
import { WorkspaceModule } from '../workspace/workspace.module';
import { TaskModule } from '../task/task.module';
import { BoardModule } from '../board/board.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Label]),
    WorkspaceModule,
    TaskModule,
    BoardModule,
  ],
  controllers: [LabelController],
  providers: [LabelService],
  exports: [LabelService],
})
export class LabelModule {}