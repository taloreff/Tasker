import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Workspace } from '../entities/workspace.entity';

export enum ProjectVisibility {
  PRIVATE = 'private',
  TEAM = 'team', 
  WORKSPACE = 'workspace'
}

@Entity({ name: 'workspace_settings' })
export class WorkspaceSettings {
  @PrimaryColumn('uuid')
  workspaceId: string;

  @Column({ name: 'allow_public_projects', default: false })
  allowPublicProjects: boolean;

  @Column({
    name: 'default_project_visibility',
    type: 'enum',
    enum: ProjectVisibility,
    default: ProjectVisibility.TEAM
  })
  defaultProjectVisibility: ProjectVisibility;

  @Column({ name: 'require_approval_for_members', default: false })
  requireApprovalForMembers: boolean;

  @Column({ name: 'allow_guest_access', default: false })
  allowGuestAccess: boolean;

  @Column({ name: 'max_members_per_workspace', nullable: true })
  maxMembersPerWorkspace?: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Workspace, { eager: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workspaceId' })
  workspace: Workspace;
}