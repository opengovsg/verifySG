import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

import { Agency } from './agency.entity'
import { Notification } from './notification.entity'

@Entity({ name: 'officer' })
export class Officer {
  @PrimaryGeneratedColumn()
  id: number

  @Column('varchar', { unique: true, nullable: false, length: 255 })
  @Check('email = lower(email)')
  email: string

  @Column('varchar', { nullable: true, length: 255 })
  name: string

  @Column('varchar', { nullable: true, length: 255 })
  position: string

  @ManyToOne(() => Agency, (agency) => agency.officers, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  agency: Agency

  @OneToMany(() => Notification, (notification) => notification.officer)
  notifications: Notification[]

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date
}
