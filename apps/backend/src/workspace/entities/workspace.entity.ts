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
import { Project } from '../../project/entities/project.entity';

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

  // Relations
  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @OneToMany(() => Team, (team) => team.workspace)
  teams: Team[];

  @OneToMany(() => Project, (project) => project.workspace)
  projects: Project[];
}