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
import { User } from '../../user/entities/user.entity';
import { Team } from '../../team/entities/team.entity';
import { WorkspaceMember } from '../../user/entities/workspace-member.entity';
import { WorkspaceSettings } from './workspace-settings.entity';
import { ActivityLog } from './activity-log.entity';
import { Board } from '../../board/entities/board.entity';

@Entity({ name: 'workspaces' })
export class Workspace {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  @Index()
  name: string;

  @Column({ name: 'description', nullable: true })
  description?: string;

  @Column({ name: 'color', default: '#FF5733' })
  color: string;

  @Column({ name: 'owner_id' })
  @Index()
  ownerId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @OneToMany(() => Team, (team) => team.workspace)
  teams: Team[];

  @OneToMany(() => WorkspaceMember, (member) => member.workspace)
  members: WorkspaceMember[];

  @OneToMany(() => Board, (board) => board.workspace)
  boards: Board[];

  @OneToMany(() => WorkspaceSettings, (settings) => settings.workspace)
  settings: WorkspaceSettings[];

  @OneToMany(() => ActivityLog, (log) => log.workspace)
  activityLogs: ActivityLog[];
}