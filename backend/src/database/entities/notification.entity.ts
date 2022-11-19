import {
  Check,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

import { SGNotifyParams } from '../../notifications/sgnotify/utils'
import { SMSParams } from '../../notifications/sms/sms.service'

import { MessageTemplate } from './message-template.entity'
import { Officer } from './officer.entity'

export enum NotificationStatus {
  NOT_SENT = 'NOT_SENT',
  SENT = 'SENT',
}

export type ModalityParams = SGNotifyParams | SMSParams

/**
 * Notification entity
 * @officer one officer can make multiple notifications
 * @notificationType either SGNotify or SMS
 * @recipientId allow us to identify who was the recipient of the notification.
 * can be NRIC or phone number (assumed to be Singapore phone number, i.e. 8 digits)
 * if we want to support international numbers or include country code, we need to increase length
 * @status currently tracks whether given notification has been sent (can be extended); SGNotify-specific statuses tracked in SGNotifyNotification
 * @callScope optional field for officer to track what call is about; currently merely recorded in database and not shown to MOP/officer on frontend (for future extension)
 * @modalityParams column to track modality-specific params (support both SGNotify and SMS)
 * @deletedAt to safeguard against accidental deletion; by right there should be no deletion at all
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

  @ManyToOne(
    () => MessageTemplate,
    (messageTemplate) => messageTemplate.notifications,
  )
  messageTemplate: MessageTemplate

  @Column('varchar', { length: 9, nullable: false })
  @Check('recipient_id = upper(recipient_id)')
  recipientId: string

  @Column({
    type: 'enum',
    enum: NotificationStatus,
    default: NotificationStatus.NOT_SENT,
  })
  status: NotificationStatus

  @Column({ type: 'jsonb' })
  modalityParams: ModalityParams

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt: Date
}
