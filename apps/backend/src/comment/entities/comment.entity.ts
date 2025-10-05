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

export enum CommentableType {
  TASK = 'TASK',
  PROJECT = 'PROJECT', 
  BOARD = 'BOARD',
  SUBTASK = 'SUBTASK',
}

@Entity({ name: 'comments' })
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ name: 'commentable_type', type: 'enum', enum: CommentableType })
  @Index()
  commentableType: CommentableType;

  @Column({ name: 'commentable_id' })
  @Index()
  commentableId: string;

  @Column({ name: 'author_id' })
  @Index()
  authorId: string;

  @Column({ name: 'parent_comment_id', nullable: true })
  @Index()
  parentCommentId?: string;

  @Column({ name: 'is_edited', default: false })
  isEdited: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'author_id' })
  author: User;

  @ManyToOne(() => Comment, { eager: false })
  @JoinColumn({ name: 'parent_comment_id' })
  parentComment?: Comment;

  @OneToMany(() => Comment, (comment) => comment.parentComment)
  replies: Comment[];

  get task() {
    return this.commentableType === CommentableType.TASK ? { id: this.commentableId } : null;
  }

  get project() {
    return this.commentableType === CommentableType.PROJECT ? { id: this.commentableId } : null;
  }

  get board() {
    return this.commentableType === CommentableType.BOARD ? { id: this.commentableId } : null;
  }
}