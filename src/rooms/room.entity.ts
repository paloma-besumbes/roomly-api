import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column()
  description!: string;

  @Column()
  capacity!: number;

  @Column({ default: false })
  hasProjector!: boolean;

  @Column({ default: false })
  hasWhiteboard!: boolean;

  @CreateDateColumn()
  createdAt!: Date;
}
