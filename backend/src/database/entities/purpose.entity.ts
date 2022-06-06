import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm'
import { Notification } from './notification.entity'
import { Agency } from './agency.entity'
import { SGNotifyMessageTemplateId } from '../../notifications/sgnotify/message-templates/message-template'

// TODO: refactor into shared folders SGNotifyTemplateParams 2/2
export interface SGNotifyTemplateParams {
  templateId: SGNotifyMessageTemplateId
  templatePurposeParams: Record<string, string> // exclude non-purpose params like agency and officer info
}

@Entity({ name: 'purpose' })
export class Purpose {
  @PrimaryColumn('varchar', { unique: true, nullable: false, length: 255 })
  purposeId: string // unique string of agency.id + short description of purpose

  @Column('varchar', { nullable: false, length: 255 })
  menuDescription: string // shown to public officer user to inform selection

  // set at the SGNotify level, so if WhatsApp support, just add another column
  @Column('jsonb', { nullable: false })
  sgNotifyTemplateParams: SGNotifyTemplateParams

  @OneToMany(() => Notification, (notification) => notification.purpose)
  notifications: Notification[]

  @ManyToOne(() => Agency, (agency) => agency.purposes, {
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
