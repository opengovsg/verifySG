import {
  Check,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

import { Agency } from './agency.entity'
import { Notification } from './notification.entity'

import {
  SGNotifyMessageTemplateParams,
  SmsMessageTemplateParams,
} from '~shared/types/api'

@Entity({ name: 'message_template' })
export class MessageTemplate {
  @PrimaryGeneratedColumn()
  id: number

  @Column('varchar', { unique: true, nullable: false, length: 255 })
  @Check('key = lower(key)')
  key: string // unique string of agency.id + short description of template

  @Column('varchar', { nullable: false, length: 255 })
  menu: string // shown to public officer user to inform selection

  @Column('jsonb', { nullable: false })
  sgNotifyMessageTemplateParams: SGNotifyMessageTemplateParams

  @Column('jsonb', { nullable: false })
  smsMessageTemplateParams: SmsMessageTemplateParams

  @OneToMany(() => Notification, (notification) => notification.messageTemplate)
  notifications: Notification[]

  @ManyToOne(() => Agency, (agency) => agency.messageTemplates, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  agency: Agency

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt: Date
}
