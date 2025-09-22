import {
  Entity,
  PrimaryGeneratedColumn,
  Column as TypeOrmColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  ManyToMany,
  JoinColumn,
  JoinTable,
  Index,
  OneToMany
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Board } from '../../board/entities/board.entity';
import { Column } from '../../column/entities/column.entity';
import { Subtask } from '../../subtask/entities/subtask.entity';
import { Label } from '../../label/entities/label.entity';

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  REVIEW = 'REVIEW',
  DONE = 'DONE',
  BLOCKED = 'BLOCKED',
  CANCELLED = 'CANCELLED'
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

@Entity({ name: 'tasks' })
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @TypeOrmColumn({ length: 200 })
  @Index()
  title: string;

  @TypeOrmColumn({ type: 'text', nullable: true })
  description?: string;

  @TypeOrmColumn({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.TODO
  })
  status: TaskStatus;

  @TypeOrmColumn({
    type: 'enum',
    enum: TaskPriority,
    default: TaskPriority.MEDIUM
  })
  priority: TaskPriority;

  @TypeOrmColumn({ name: 'due_date', type: 'date', nullable: true })
  dueDate?: Date;

  @TypeOrmColumn({ name: 'created_by_id' })
  @Index()
  createdById: string;

  @TypeOrmColumn({ name: 'column_id' })
  @Index()
  columnId: string;

  @TypeOrmColumn({ name: 'board_id' })
  @Index()
  boardId: string;

  @TypeOrmColumn({ type: 'int', default: 0 })
  position: number;

  @TypeOrmColumn({
    name: 'estimated_hours',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true
  })
  estimatedHours?: number;

  @TypeOrmColumn({
    name: 'actual_hours',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true
  })
  actualHours?: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;

  @ManyToOne(() => Column, { eager: false })
  @JoinColumn({ name: 'column_id' })
  column: Column;

  @ManyToOne(() => Board, { eager: false })
  @JoinColumn({ name: 'board_id' })
  board: Board;

  @OneToMany(
    () => Subtask,
    subtask => subtask.task
  )
  subtasks: Subtask[];

  @ManyToMany(() => User)
  @JoinTable({
    name: 'task_assignees',
    joinColumn: { name: 'task_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' }
  })
  assignees: User[];

  @ManyToMany(
    () => Label,
    label => label.tasks
  )
  @JoinTable({
    name: 'task_labels',
    joinColumn: { name: 'task_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'label_id', referencedColumnName: 'id' }
  })
  labels: Label[];
}
