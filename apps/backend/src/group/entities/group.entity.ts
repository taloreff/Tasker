import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
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

export enum GroupType {
  STATUS = 'status',
  PRIORITY = 'priority',
  CATEGORY = 'category',
  CUSTOM = 'custom',
}

@Entity({ name: 'groups' })
@Index(['boardId', 'position'])
export class Group {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'enum', enum: GroupType, default: GroupType.STATUS })
  groupType: GroupType;

  @Column({ length: 7, nullable: true })
  color?: string;

  @Column({ name: 'board_id' })
  @Index()
  boardId: string;

  @Column({ type: 'int', default: 0 })
  position: number;

  @Column({ name: 'is_collapsed', type: 'boolean', default: false })
  isCollapsed: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date;

  @ManyToOne(() => Board, (board) => board.groups, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'board_id' })
  board: Board;

  @OneToMany(() => Task, (task) => task.group)
  tasks: Task[];
}
