import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Column } from './entities/column.entity';
import { ColumnService } from './column.service';
import { ColumnController } from './column.controller';
import { BoardModule } from '../board/board.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Column]),
    BoardModule,
  ],
  controllers: [ColumnController],
  providers: [ColumnService],
  exports: [ColumnService],
})
export class ColumnModule {}