import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm'

import { Officer } from './officer.entity'

@Entity({ name: 'agency' })
export class Agency {
  @PrimaryGeneratedColumn()
  id!: number

  @Column('varchar', { nullable: false, length: 255 })
  name!: string

  @Column('varchar', { nullable: false, length: 255 })
  shortName!: string

  @Column('text', { nullable: true, default: null })
  logoUrl!: string

  @OneToMany(() => Officer, (officer) => officer.agency)
  officers!: Officer[]

  @Column('varchar', { array: true, length: 255, default: [] })
  emailDomains!: string[]

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}
