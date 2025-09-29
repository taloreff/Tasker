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
import { Board } from './board.entity';
import { User } from '../../user/entities/user.entity';

export enum ViewType {
  TABLE = 'table',
  KANBAN = 'kanban',
  CALENDAR = 'calendar',
  TIMELINE = 'timeline',
  CHART = 'chart',
  MAP = 'map',
  FORM = 'form'
}

@Entity({ name: 'board_views' })
@Index(['boardId', 'name'])
export class BoardView {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({
    type: 'enum',
    enum: ViewType,
    default: ViewType.TABLE
  })
  viewType: ViewType;

  @Column({ name: 'board_id' })
  boardId: string;

  @Column({ name: 'created_by_id' })
  createdById: string;

  @Column({ type: 'json', nullable: true })
  configuration?: object;

  @Column({ name: 'is_default', type: 'boolean', default: false })
  isDefault: boolean;

  @Column({ name: 'is_private', type: 'boolean', default: false })
  isPrivate: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Board)
  @JoinColumn({ name: 'board_id' })
  board: Board;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;
}
