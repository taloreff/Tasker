import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subtask } from './entities/subtask.entity';
import { SubtaskService } from './subtask.service';
import { SubtaskController } from './subtask.controller';
import { TaskModule } from '../task/task.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Subtask]),
    TaskModule,
    UserModule,
  ],
  controllers: [SubtaskController],
  providers: [SubtaskService],
  exports: [SubtaskService],
})
export class SubtaskModule {}