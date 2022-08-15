import { ISession } from 'connect-typeorm'
import { Column, DeleteDateColumn, Entity, Index, PrimaryColumn } from 'typeorm'

@Entity()
export class Session implements ISession {
  @Index()
  @Column('bigint')
  expiredAt = Date.now()

  @PrimaryColumn('varchar', { length: 255 })
  id: string

  @Column('text', { default: '' })
  json: string

  @DeleteDateColumn()
  destroyedAt?: Date
}
