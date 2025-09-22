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
import { Team } from './team.entity';

export enum TeamRole {
  TEAM_ADMIN = 'TEAM_ADMIN',
  TEAM_MEMBER = 'TEAM_MEMBER',
}

@Entity({ name: 'user_team_roles' })
@Index(['teamId', 'userId'], { unique: true }) // Prevent duplicate memberships
export class UserTeamRole {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'team_id' })
  @Index()
  teamId: string;

  @Column({ name: 'user_id' })
  @Index()
  userId: string;

  @Column({
    type: 'enum',
    enum: TeamRole,
    default: TeamRole.TEAM_MEMBER,
  })
  role: TeamRole;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => Team, { eager: false })
  @JoinColumn({ name: 'team_id' })
  team: Team;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'user_id' })
  user: User;
}