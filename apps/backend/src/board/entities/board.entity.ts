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
  Index
} from 'typeorm';
import { Workspace } from '../../workspace/entities/workspace.entity';
import { User } from '../../user/entities/user.entity';
import { Team } from '../../team/entities/team.entity';
import { Task } from '../../task/entities/task.entity';
import { Group } from '../../group/entities/group.entity';

@Entity({ name: 'boards' })
@Index(['workspaceId', 'name'])
export class Board {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  @Index()
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'workspace_id' })
  @Index()
  workspaceId: string;

  @Column({ name: 'owner_id' })
  @Index()
  ownerId: string;

  @Column({ name: 'assigned_team_id', nullable: true })
  @Index()
  assignedTeamId?: string;

  @Column({ length: 7, default: '#0073EA' })
  color: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date;

  @ManyToOne(() => Workspace, { eager: false })
  @JoinColumn({ name: 'workspace_id' })
  workspace: Workspace;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @ManyToOne(() => Team, { eager: false, nullable: true })
  @JoinColumn({ name: 'assigned_team_id' })
  assignedTeam?: Team;

  @OneToMany(
    () => Task,
    task => task.board
  )
  tasks: Task[];

  @OneToMany(
    () => Group,
    group => group.board,
    {
      cascade: true
    }
  )
  groups: Group[];
}
