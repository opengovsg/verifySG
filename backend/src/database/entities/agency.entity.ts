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
  @PrimaryColumn('varchar', {
    unique: true,
    nullable: false,
    length: 255,
    transformer: {
      // ensures agency short name is always uppercase
      to: (value: string) => value.toUpperCase(),
      from: (value: string) => value.toUpperCase(),
    },
  })
  id: string // agency short name, e.g. 'OGP', 'SPF'

  @Column('varchar', { nullable: false, length: 255 })
  name: string

  @Column('text', { nullable: true, default: null })
  logoUrl: string

  @OneToMany(() => Officer, (officer) => officer.agency)
  officers: Officer[]

  @Column('varchar', {
    array: true,
    length: 255,
    default: [],
    transformer: {
      // ensure email domains are always lowercase
      to: (values: string[]) => values.map((value) => value.toLowerCase()),
      from: (values: string[]) => values.map((value) => value.toLowerCase()),
    },
  })
  emailDomains: string[]

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date
}
