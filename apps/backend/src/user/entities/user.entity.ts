import * as bcrypt from 'bcrypt';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  BeforeInsert,
  BeforeUpdate,
  Index,
  JoinTable,
  ManyToMany,
} from 'typeorm';
import { Role } from './role.entity';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  @Index()
  name: string;

  @Column({ unique: true })
  @Index({ unique: true })
  email: string;

  @Column({ name: 'password_hash', select: false })
  passwordHash: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date;

  @ManyToMany(() => Role, (role) => role.users, { eager: true })
  @JoinTable({ name: 'user_roles' })
  roles: Role[];

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.passwordHash) {
      this.passwordHash = await bcrypt.hash(this.passwordHash, 10);
    }
  }
}
