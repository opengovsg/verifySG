import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm'

import { Call } from './call.entity'

@Entity({ name: 'mop' })
export class Mop {
  @PrimaryGeneratedColumn()
  id!: number

  @Column('varchar', { unique: true, nullable: false, length: 255 })
  nric!: string

  @CreateDateColumn()
  createdAt!: Date

  @OneToMany(() => Call, (call) => call.mop)
  calls!: Call[]
}
