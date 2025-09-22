import {
  Entity,
  PrimaryGeneratedColumn,
  Column as TypeOrmColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { Board } from '../../board/entities/board.entity';
import { Task } from '../../task/entities/task.entity';

@Entity({ name: 'columns' })
export class Column {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @TypeOrmColumn({ length: 100 })
  @Index()
  name: string;

  @TypeOrmColumn({ name: 'board_id' })
  @Index()
  boardId: string;

  @TypeOrmColumn({ type: 'int', default: 0 })
  position: number;

  @TypeOrmColumn({ length: 7, nullable: true })
  color?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date;

  @ManyToOne(() => Board, { eager: false })
  @JoinColumn({ name: 'board_id' })
  board: Board;

  @OneToMany(() => Task, (task) => task.column)
  tasks: Task[];
}