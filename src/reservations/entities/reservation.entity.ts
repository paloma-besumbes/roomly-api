import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Room } from '../../rooms/room.entity';

import { User } from '../../users/entities/user.entity';

@Entity('reservations')
export class Reservation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'timestamp',
  })
  startTime!: Date;

  @Column({
    type: 'timestamp',
  })
  endTime!: Date;

  // Many reservations can be made for a room
  @ManyToOne(() => Room, { eager: true })
  room!: Room;

  // Many reservation can be made by a user
  @ManyToOne(() => User, { eager: true })
  user!: User;

  @CreateDateColumn()
  createdAt!: Date;
}
