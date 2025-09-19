import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';

@Entity('classrooms')
export class Classroom {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text', { nullable: true })
  description: string;

  @Column()
  ageGroupMin: number;

  @Column()
  ageGroupMax: number;

  @Column()
  capacity: number;

  @Column({ default: true })
  isActive: boolean;

  @Column()
  centerId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @ManyToOne('Center', 'classrooms')
  @JoinColumn({ name: 'centerId' })
  center: any;

  @OneToMany('User', 'classroom')
  users: any[];

  @OneToMany('Child', 'classroom')
  children: any[];
}
