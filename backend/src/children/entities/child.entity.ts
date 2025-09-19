import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('children')
export class Child {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ type: 'date' })
  birthDate: Date;

  @Column({ type: 'varchar', default: 'other' })
  gender: string;

  @Column({ type: 'text', nullable: true })
  allergies: string;

  @Column({ type: 'varchar', nullable: true })
  emergencyContactName: string;

  @Column({ type: 'varchar', nullable: true })
  emergencyContactPhone: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  centerId: string;

  @Column({ nullable: true })
  classroomId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne('Classroom', 'children', { eager: true })
  @JoinColumn({ name: 'classroomId' })
  classroom: any;
}
