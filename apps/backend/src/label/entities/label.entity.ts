import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  ManyToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Workspace } from '../../workspace/entities/workspace.entity';
import { Task } from '../../task/entities/task.entity';

@Entity({ name: 'labels' })
export class Label {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50 })
  @Index()
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ length: 7 })
  color: string; // Hex color code like #FF5733

  @Column({ name: 'workspace_id' })
  @Index()
  workspaceId: string;

  @Column({ name: 'created_by_id' })
  @Index()
  createdById: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date;

  // Relations
  @ManyToOne(() => Workspace, { eager: false })
  @JoinColumn({ name: 'workspace_id' })
  workspace: Workspace;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;

  @ManyToMany(() => Task, (task) => task.labels)
  tasks: Task[];
}