import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Workspace } from '../entities/workspace.entity';

export enum ActivityAction {
  CREATED = 'created',
  UPDATED = 'updated', 
  DELETED = 'deleted',
  ASSIGNED = 'assigned',
  UNASSIGNED = 'unassigned',
  STATUS_CHANGED = 'status_changed',
  MEMBER_ADDED = 'member_added',
  MEMBER_REMOVED = 'member_removed',
  ROLE_CHANGED = 'role_changed'
}

export enum ActivityEntityType {
  WORKSPACE = 'workspace',
  TEAM = 'team',
  PROJECT = 'project',
  BOARD = 'board',
  COLUMN = 'column',
  TASK = 'task',
  SUBTASK = 'subtask',
  COMMENT = 'comment',
  LABEL = 'label'
}

@Entity({ name: 'activity_logs' })
@Index(['workspaceId', 'createdAt']) // For workspace activity feeds
@Index(['entityType', 'entityId']) // For entity-specific activity
export class ActivityLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  @Index()
  userId: string;

  @Column({ name: 'workspace_id' })
  @Index()
  workspaceId: string;

  @Column({
    name: 'entity_type',
    type: 'enum',
    enum: ActivityEntityType
  })
  @Index()
  entityType: ActivityEntityType;

  @Column({ name: 'entity_id' })
  @Index()
  entityId: string;

  @Column({
    name: 'action',
    type: 'enum',
    enum: ActivityAction
  })
  action: ActivityAction;

  @Column({ type: 'json', nullable: true })
  changes?: Record<string, unknown>; // Store before/after values for updates

  @Column({ type: 'json', nullable: true })
  metadata?: Record<string, unknown>; // Additional context (IP, user agent, etc.)

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Workspace, { eager: false })
  @JoinColumn({ name: 'workspace_id' })
  workspace: Workspace;
}