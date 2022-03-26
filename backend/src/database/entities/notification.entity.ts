import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  UpdateDateColumn,
} from 'typeorm'

import { Call } from './call.entity'

export enum NotificationType {
  SGNOTIFY = 'SGNOTIFY',
  WHATSAPP = 'WHATSAPP',
}
export interface SGNotifyRecipientId {
  nric: string
}

export interface SGNotifyParams {
  agencyLogoUrl: string
  senderName: string
  title: string
  shortMessage: string
  templateId: string
  sgNotifyLongMessageParams: SGNotifyTemplateParams
}

type SGNotifyTemplateParams = Record<string, string>

export enum SGNotifyNotificationStatus {
  SENT_BY_SERVER = 'SENT_BY_SERVER',
  RECEIVED_BY_DEVICE = 'RECEIVED_BY_DEVICE',
  READ_BY_USER = 'READ_BY_USER',
}

export interface SGNotifyResponse {
  requestId: string
}

@Entity({ name: 'notification' })
export class Notification {
  @PrimaryGeneratedColumn()
  id!: number

  @ManyToOne(() => Call, (call) => call.notifications, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  call!: Call

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  notificationType!: NotificationType

  // will be (1) NRIC (9 chars) or (2) phone number (8 digits), based on NotificationType
  @Column('varchar', { length: 9, nullable: false })
  recipientId!: SGNotifyRecipientId

  @Column({ type: 'jsonb' })
  notificationParams!: SGNotifyParams

  @Column('varchar', { length: 255, nullable: false })
  notificationStatus!: SGNotifyNotificationStatus

  @Column({ type: 'jsonb' })
  notificationResponse!: SGNotifyResponse

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}
