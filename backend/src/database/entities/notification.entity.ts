import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  UpdateDateColumn,
  OneToOne,
  DeleteDateColumn,
} from 'typeorm'

import { Call } from './call.entity'
import { SGNotifyNotification } from './sgnotify.entity'

export enum NotificationType {
  SGNOTIFY = 'SGNOTIFY',
  WHATSAPP = 'WHATSAPP',
}

export enum NotificationStatus {
  NOT_SENT = 'NOT_SENT',
  SENT = 'SENT',
}

/**
 * Notification entity
 * @call one call can have multiple notifications; in a happy code path, each call will trigger one notification, which succeed and ends the call. in a sad code path, notification may fail, allowing user to re-trigger notifications
 * @notificationType currently SGNotify only, will support WhatsApp in future
 * @recipientId allow us to identify who was the recipient of the notification. either (1) NRIC (9 chars) or (2) phone number (8 digits). NRIC replicated in SGNotifyNotification.uin
 * @status rough indicator of whether notification is sent successfully; more specific statuses in SGNotifyNotification
 * @deletedAt added to safeguard against accidental deletion; by right there should be no deletion at all
 */
@Entity({ name: 'notification' })
export class Notification {
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(() => Call, (call) => call.notifications, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  call: Call

  @OneToOne(
    () => SGNotifyNotification,
    (sgNotifyNotification) => sgNotifyNotification.notification,
    { nullable: true, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
  )
  sgNotifyNotification: SGNotifyNotification

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

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @DeleteDateColumn()
  deletedAt: Date
}
