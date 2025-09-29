import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { BoardItem } from '../../task/entities/task.entity';
import { User } from '../../user/entities/user.entity';

@Entity({ name: 'board_subitems' })
@Index(['itemId', 'position'])
export class BoardSubitem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'boolean', default: false })
  completed: boolean;

  @Column({ name: 'item_id' })
  itemId: string;

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

  @ManyToOne(() => BoardItem)
  @JoinColumn({ name: 'item_id' })
  item: BoardItem;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assignee_id' })
  assignee?: User;
}

// Alias for backward compatibility
export const Subtask = BoardSubitem;
