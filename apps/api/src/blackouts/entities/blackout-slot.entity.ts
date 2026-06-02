import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn,
  CreateDateColumn, Index, Unique,
} from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity';

@ObjectType()
@Entity({ name: 'blackout_slots' })
@Unique('uq_blackout_user_start', ['userId', 'startAt'])
export class BlackoutSlot {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => ID)
  @Column()
  @Index()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Field()
  @Column({ type: 'datetime' })
  startAt: Date;

  @Field()
  @Column({ type: 'datetime' })
  endAt: Date;

  @Field()
  @CreateDateColumn()
  createdAt: Date;
}
