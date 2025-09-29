import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoardGroup } from './entities/column.entity';
import { ColumnService } from './column.service';
import { ColumnController } from './column.controller';
import { BoardModule } from '../board/board.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([BoardGroup]),
    BoardModule,
  ],
  controllers: [ColumnController],
  providers: [ColumnService],
  exports: [ColumnService],
})
export class ColumnModule {}