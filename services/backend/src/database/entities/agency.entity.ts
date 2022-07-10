import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm'

import { Officer } from './officer.entity'

@Entity({ name: 'agency' })
export class Agency {
  @PrimaryColumn('varchar', { unique: true, nullable: false, length: 255 })
  id: string // shortName

  @Column('varchar', { nullable: false, length: 255 })
  name: string

  @Column('text', { nullable: true, default: null })
  logoUrl: string

  @OneToMany(() => Officer, (officer) => officer.agency)
  officers: Officer[]

  @Column('varchar', { array: true, length: 255, default: [] })
  emailDomains: string[]

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date
}
