/**
 * OTP entity
 * @officer one officer can receive multiple OTPs
 * @recipientId allow us to identify who was the recipient of the notification; currently NRIC only; could be phone number in future
 * @status currently tracks whether given notification has been sent (enum for possible extension); SGNotify-specific statuses tracked in SGNotifyNotification
 * @callScope optional field for officer to track what call is about; currently merely recorded in database and not shown to MOP/officer on frontend (for future extension)
 * @modalityParams column to track modality-specific params (only SGNotify params for now; to support WhatsApp in future)
 */
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

@Entity({ name: 'otp' })
export class OTP {
  @PrimaryGeneratedColumn()
  id: number

  @Column('varchar', { nullable: false, length: 255 })
  email: string

  @Column('varchar', { nullable: false, length: 255 })
  hash: string

  @Column('smallint', { nullable: false, default: 0 })
  numOfAttempts: number

  @Column('timestamp', { nullable: false })
  expiredAt: Date

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @DeleteDateColumn()
  deletedAt: Date
}
