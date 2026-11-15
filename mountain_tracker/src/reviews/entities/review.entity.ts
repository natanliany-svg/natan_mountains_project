import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Mountain } from '../../mountains/entities/mountain.entity.js';
import { User } from '../../auth/entities/user.entity.js';

// (#48)
@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  mountainId: number;

  @ManyToOne(() => Mountain, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'mountainId' })
  mountain: Mountain;

  @Column()
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'int' })
  rating: number;

  @Column({ type: 'nvarchar', length: 'MAX' })
  comment: string;

  @CreateDateColumn()
  createdAt: Date;
}
