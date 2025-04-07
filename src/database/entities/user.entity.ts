import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Document } from './document.entity';
import { Role } from './role.entity';
import { IngestionTask } from './ingestion-task.entity';
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @ManyToOne(() => Role, (role) => role.users, { eager: true })
  @JoinColumn({ name: 'roleId' })
  role: Role;

  @OneToMany(() => Document, (document) => document.user, { cascade: true })
  documents: Document[];

  @OneToMany(() => IngestionTask, (ingestionTask) => ingestionTask.user)
  ingestionTasks: IngestionTask[];
}
