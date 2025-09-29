import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  ManyToMany,
  OneToMany,
  JoinColumn,
  JoinTable,
  Index,
} from 'typeorm';
import { BoardGroup } from '../../column/entities/column.entity';
import { User } from '../../user/entities/user.entity';
import { Label } from '../../label/entities/label.entity';

export enum ItemStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  REVIEW = 'review', 
  DONE = 'done',
  BLOCKED = 'blocked',
  CANCELLED = 'cancelled'
}

export enum ItemPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

@Entity({ name: 'board_items' })
@Index(['groupId', 'position'])
export class BoardItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: ItemStatus,
    default: ItemStatus.TODO
  })
  status: ItemStatus;

  @Column({
    type: 'enum',
    enum: ItemPriority,
    default: ItemPriority.MEDIUM
  })
  priority: ItemPriority;

  @Column({ name: 'group_id' })
  groupId: string;

  @Column({ name: 'created_by_id' })
  createdById: string;

  @Column({ name: 'assignee_id', nullable: true })
  assigneeId?: string;

  @Column({ type: 'int', default: 0 })
  position: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => BoardGroup)
  @JoinColumn({ name: 'group_id' })
  group: BoardGroup;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assignee_id' })
  assignee?: User;
}

// Aliases for backward compatibility
export const Task = BoardItem;
export const TaskStatus = ItemStatus;
export const TaskPriority = ItemPriority;
