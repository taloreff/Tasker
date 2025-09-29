import {
  Entity,
  PrimaryGeneratedColumn,
  Column as DBColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index
} from 'typeorm';
import { Board } from '../../board/entities/board.entity';

export enum GroupType {
  STATUS = 'status',
  PRIORITY = 'priority',
  CATEGORY = 'category',
  CUSTOM = 'custom'
}

@Entity({ name: 'board_groups' })
@Index(['boardId', 'position'])
export class BoardGroup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @DBColumn({ length: 100 })
  name: string;

  @DBColumn({ type: 'text', nullable: true })
  description?: string;

  @DBColumn({
    type: 'enum',
    enum: GroupType,
    default: GroupType.STATUS
  })
  groupType: GroupType;

  @DBColumn({ length: 7, nullable: true })
  color?: string;

  @DBColumn({ name: 'board_id' })
  @Index()
  boardId: string;

  @DBColumn({ type: 'int', default: 0 })
  position: number;

  @DBColumn({ name: 'is_collapsed', type: 'boolean', default: false })
  isCollapsed: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date;

  // Relationships
  @ManyToOne(() => Board, { eager: false })
  @JoinColumn({ name: 'board_id' })
  board: Board;

  @OneToMany('BoardItem', 'group')
  items: object[];
}

export const Column = BoardGroup;
