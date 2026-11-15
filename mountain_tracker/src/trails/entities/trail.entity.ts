import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Mountain } from '../../mountains/entities/mountain.entity.js';

// (#41)
@Entity('trails')
export class Trail {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  mountainId: number;

  @ManyToOne(() => Mountain, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'mountainId' })
  mountain: Mountain;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  length: number;

  @Column({ type: 'int' })
  estimatedTime: number;

  @Column({ type: 'int' })
  difficultyLevel: number;

  @Column({ default: false })
  isCircular: boolean;
}
