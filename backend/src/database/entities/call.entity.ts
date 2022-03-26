import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm'

import { Officer } from './officer.entity'
import { Notification } from './notification.entity'

@Entity({ name: 'call' })
export class Call {
  @PrimaryGeneratedColumn()
  id!: number

  @ManyToOne(() => Officer, (officer) => officer.calls, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  officer!: Officer

  @OneToMany(() => Notification, (notification) => notification.call)
  notifications!: Notification[]

  @Column('text', { nullable: true, default: null })
  callScope!: string

  @CreateDateColumn()
  createdAt!: Date
}
