import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity';

@ObjectType()
@Entity({ name: 'availability_rules' })
export class Availability {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => ID)
  @Column()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  /** 0 = Sunday … 6 = Saturday */
  @Field(() => Int)
  @Column('int')
  weekday: number;

  /** HH:MM, local-to-UTC for demo */
  @Field()
  @Column()
  startTime: string;

  @Field()
  @Column()
  endTime: string;

  @Field(() => Int)
  @Column('int')
  slotDurationMinutes: number;
}
