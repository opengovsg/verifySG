import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm'

import { MessageTemplate } from './message-template.entity'
import { Officer } from './officer.entity'

@Entity({ name: 'agency' })
export class Agency {
  @PrimaryColumn('varchar', { unique: true, nullable: false, length: 255 })
  @Check('id = upper(id)')
  id: string // shortName

  @Column('varchar', { nullable: false, length: 255 })
  name: string

  @Column('text', { nullable: true, default: null })
  logoUrl: string

  @OneToMany(() => Officer, (officer) => officer.agency)
  officers: Officer[]

  @OneToMany(() => MessageTemplate, (messageTemplate) => messageTemplate.agency)
  messageTemplates: MessageTemplate[]

  @Column('varchar', { array: true, length: 255, default: [] })
  @Check('email_domains = lower(email_domains::varchar)::varchar[]')
  emailDomains: string[]

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date
}
