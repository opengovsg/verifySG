import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

// just a first approximation; can edit based on business logic
export interface DisplayData {
  sender: string
  recipient: string
  timestamp: Date
}

/* TODO: delete this discussion before merging
 * should we establish a one-to-one relationship between UniqueParam and Notification?
 * NO:
 * - only notifications of NotificationType.SMS will have a uniqueParamString
 * - we can add the uniqueParamString in ModalityParams, which can be query-able via SQL or TypeORM
 *
 * should we have a column to track expiry (e.g. expiredAt)?
 * good-to-have, but not necessary in MVP? or just create first?
 * */

/**
 * Notification entity
 * @uniqueParamString the uniquely generated parameter generated for each message
 * @displayData the data to be displayed to assure users of the authenticity of the message
 * @numOfQueries keep track (and possibly limit) number of queries per uniqueParamString. strictly not necessary, but useful to track usage. trade-off: UPDATE query will be slower than SELECT query, could be a problem with high traffic
 */
@Entity({ name: 'unique_param' })
export class UniqueParam {
  @PrimaryGeneratedColumn()
  id: number

  // pretty sure 255 is long enough; if not long enough, we can increase it?
  @Column('varchar', { unique: true, nullable: false, length: 255 })
  uniqueParamString: string

  @Column('jsonb')
  displayData: DisplayData

  @Column('smallint', { nullable: false, default: 0 })
  numOfQueries: number

  // @Column('timestamptz', { nullable: false })
  // expiredAt: Date

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt: Date
}
