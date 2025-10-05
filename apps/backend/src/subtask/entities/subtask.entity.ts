import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Task } from '../../task/entities/task.entity';
import { User } from '../../user/entities/user.entity';

@Entity({ name: 'subtask' })
@Index(['itemId', 'position'])
export class Subtask {
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

  @ManyToOne(() => Task)
  @JoinColumn({ name: 'item_id' })
  item: Task;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assignee_id' })
  assignee?: User;
}
