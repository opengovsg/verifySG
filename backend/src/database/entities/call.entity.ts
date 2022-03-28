import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  DeleteDateColumn,
} from 'typeorm'

import { Officer } from './officer.entity'
import { Notification } from './notification.entity'

/**
 * Call entity
 * @officer one officer can trigger many calls
 * @notification one call can have multiple notifications
 * @callScope optional field for officer to specify; will work into something more systematic in future
 * @deletedAt added to safeguard against accidental deletion; by right there should be no deletion at all
 */
@Entity({ name: 'call' })
export class Call {
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(() => Officer, (officer) => officer.calls, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  officer: Officer

  @OneToMany(() => Notification, (notification) => notification.call)
  notifications: Notification[]

  @Column('text', { nullable: true, default: null })
  callScope: string

  @CreateDateColumn()
  createdAt: Date

  @DeleteDateColumn()
  deletedAt: Date
}
