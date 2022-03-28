import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

import { Notification } from './notification.entity'

export enum SGNotifyNotificationStatus {
  NOT_SENT = 'NOT_SENT',
  SENT_BY_SERVER = 'SENT_BY_SERVER',
  RECEIVED_BY_DEVICE = 'RECEIVED_BY_DEVICE',
  READ_BY_USER = 'READ_BY_USER',
}
/**
 * SGNotifyNotification entity
 * @agencyLogoUrl should be file.go.gov.sg (self-host logo), so no need to save actual image
 * @senderName typically agency name in full
 * @title title of SGNotify message
 * @uin identical to Notification.recipientId; should be NRIC of recipient
 * @shortMessage displayed in push notification summary and Singpass Inbox list view
 * @templateId to identify message template approved by GovTech
 * @sgNotifyLongMessageParams allow us to re-generate the content of the notification, which would be useful for logging -> can be further extended if we want to make say create a dashboard for agencies' admin to log in and see what messages their officers have been sending
 * @status enum showing status of SGNotify message; can be updated by consuming SGNotify Notification Status endpoint
 * @requestId id provided by SGNotify API to identify specific request; can be used to query SGNotify API for status
 * @deletedAt added to safeguard against accidental deletion; by right there should be no deletion at all
 */
@Entity({ name: 'sgnotify' })
export class SGNotifyNotification {
  @PrimaryGeneratedColumn()
  id!: number

  @OneToOne(
    () => Notification,
    (notification) => notification.sgNotifyNotification,
    { nullable: true, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
  )
  notification!: Notification

  @Column({ type: 'varchar', length: 255 })
  agencyLogoUrl: string

  @Column({ type: 'varchar', length: 255 })
  senderName!: string

  @Column({ type: 'varchar', length: 50 })
  title!: string

  @Column({ type: 'varchar', length: 9 })
  uin!: string

  @Column({ type: 'varchar', length: 100 })
  shortMessage!: string

  @Column({ type: 'varchar', length: 50 })
  templateId!: string

  @Column({ type: 'json' })
  sgNotifyLongMessageParams!: Record<string, string>

  @Column({
    type: 'enum',
    enum: SGNotifyNotificationStatus,
    default: SGNotifyNotificationStatus.NOT_SENT,
  })
  status!: SGNotifyNotificationStatus

  @Column({ type: 'varchar', length: 50 })
  requestId!: string

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date

  @DeleteDateColumn()
  deletedAt!: Date
}
