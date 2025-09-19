import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('attendance')
export class Attendance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'time', nullable: true })
  checkInTime: string | null;

  @Column({ type: 'time', nullable: true })
  checkOutTime: string | null;

  @Column({ type: 'varchar', nullable: true })
  status: string | null;

  @Column({ type: 'text', nullable: true })
  checkInNotes: string | null;

  @Column({ type: 'text', nullable: true })
  checkOutNotes: string | null;

  @Column({ default: true })
  isActive: boolean;

  @Column()
  childId: string;

  @Column({ nullable: true })
  checkInByUserId: string | null;

  @Column({ nullable: true })
  checkOutByUserId: string | null;

  @Column({ nullable: true })
  centerId: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne('Child', 'attendances', { eager: true })
  @JoinColumn({ name: 'childId' })
  child: any;
}
