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

import { Officer } from './officer.entity'

export enum NotificationType {
  SGNOTIFY = 'SGNOTIFY',
  // currently, only supports SGNotify; likely will support WhatsApp in future
  WHATSAPP = 'WHATSAPP',
}

export enum NotificationStatus {
  NOT_SENT = 'NOT_SENT',
  SENT = 'SENT',
}

export enum SGNotifyNotificationStatus {
  NOT_SENT = 'NOT_SENT',
  SENT_BY_SERVER = 'SENT_BY_SERVER',
  // last two enums unused for now; can be obtained by consuming notification status endpoints
  RECEIVED_BY_DEVICE = 'RECEIVED_BY_DEVICE',
  READ_BY_USER = 'READ_BY_USER',
}

export type ModalityParams = SGNotifyParams // to extend in future

/**
 * Notification entity
 * @officer one officer can make multiple notifications
 * @notificationType
 * @recipientId allow us to identify who was the recipient of the notification; currently NRIC only; could be phone number in future
 * @status currently tracks whether given notification has been sent (enum for possible extension); SGNotify-specific statuses tracked in SGNotifyNotification
 * @callScope optional field for officer to track what call is about; currently merely recorded in database and not shown to MOP/officer on frontend (for future extension)
 * @modalityParams column to track modality-specific params (only SGNotify params for now; to support WhatsApp in future)
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

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  notificationType: NotificationType

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
