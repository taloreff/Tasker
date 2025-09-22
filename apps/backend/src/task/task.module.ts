import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { BoardModule } from '../board/board.module';
import { ColumnModule } from '../column/column.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task]),
    BoardModule,
    ColumnModule,
    UserModule,
  ],
  controllers: [TaskController],
  providers: [TaskService],
  exports: [TaskService],
})
export class TaskModule {}