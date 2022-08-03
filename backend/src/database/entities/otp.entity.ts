/**
 * OTP entity
 * @email user provided .gov.sg email to log in; precedes account creation, therefore not linked to Officer
 * @hash hash of the OTP
 * @numOfAttempts keep track and limit number of attempts per OTP
 * @expiredAt when the OTP expires
 * @createdAt when the OTP is created
 * @updatedAt when the OTP is updated (currently only when numOfAttempts is incremented)
 * no deletedAt as OTPs that are successfully logged in are hard deleted
 */
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

@Entity({ name: 'otp' })
export class OTP {
  @PrimaryGeneratedColumn()
  id: number

  @Column('varchar', {
    nullable: false,
    length: 255,
    transformer: {
      // ensure email address is always lowercase
      to: (value: string) => value.toLowerCase(),
      from: (value: string) => value.toLowerCase(),
    },
  })
  email: string

  @Column('varchar', { nullable: false, length: 255 })
  hash: string

  @Column('smallint', { nullable: false, default: 0 })
  numOfAttempts: number

  @Column('timestamptz', { nullable: false })
  expiredAt: Date

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date
}
