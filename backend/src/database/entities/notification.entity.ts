import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  UpdateDateColumn,
} from 'typeorm'

import { Officer } from './officer.entity'

export enum NotificationType {
  SGNOTIFY = 'SGNOTIFY',
  WHATSAPP = 'WHATSAPP',
}

export enum NotificationStatus {
  NOT_SENT = 'NOT_SENT',
  SENT = 'SENT',
}

export enum SGNotifyNotificationStatus {
  NOT_SENT = 'NOT_SENT',
  SENT_BY_SERVER = 'SENT_BY_SERVER',
  RECEIVED_BY_DEVICE = 'RECEIVED_BY_DEVICE',
  READ_BY_USER = 'READ_BY_USER',
}

export enum MessageTemplateId {
  SPF_POLICE_REPORT_PHONE_CALL = 'GOVTECH-CHECKWHO-01',
  GENERIC_PHONE_CALL = 'GOVTECH-CHECKWHO-GEN-01',
  GOVTECH_FEEDBACK_PHONE_CALL = 'GOVTECH-CHECKWHO-GT-01',
}

export interface SGNotifyParams {
  agencyLogoUrl: string
  senderName: string
  title: string
  uin: string // NRIC
  shortMessage: string
  templateId: MessageTemplateId
  sgNotifyLongMessageParams: Record<string, string>
  status: SGNotifyNotificationStatus
  requestId?: string
}

/**
 * Notification entity
 * @officer one officer can make multiple notifications
 * @notificationType currently SGNotify only, will support WhatsApp in future
 * @recipientId allow us to identify who was the recipient of the notification; currently NRIC only; could be phone number in future
 * @status rough indicator of whether notification is sent successfully; more specific statuses in SGNotifyNotification
 * @callScope optional field for officer to track what call is about; will work into something more systematic in future
 * @deletedAt added to safeguard against accidental deletion; by right there should be no deletion at all
 */
@Entity({ name: 'notification' })
export class Notification {
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(() => Officer, (officer) => officer.notifications, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  officer: Officer

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  notificationType: NotificationType

  @Column('varchar', { length: 9, nullable: false })
  recipientId: string

  @Column({
    type: 'enum',
    enum: NotificationStatus,
    default: NotificationStatus.NOT_SENT,
  })
  status: NotificationStatus

  @Column('text', { nullable: true, default: null })
  callScope: string

  @Column({ type: 'jsonb' })
  sgNotifyParams: SGNotifyParams

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @DeleteDateColumn()
  deletedAt: Date
}
