import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn,
  CreateDateColumn, Index, Unique,
} from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity';
import { BookingStatus } from '../dto/booking-status.enum';

@ObjectType()
@Entity({ name: 'bookings' })
@Unique('uq_booking_user_start', ['userId', 'startAt'])
export class Booking {
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
  @Column()
  customerName: string;

  @Field()
  @Column()
  customerEmail: string;

  @Field(() => BookingStatus)
  @Column({ type: 'text', default: BookingStatus.CONFIRMED })
  status: BookingStatus;

  @Field()
  @CreateDateColumn()
  createdAt: Date;
}
