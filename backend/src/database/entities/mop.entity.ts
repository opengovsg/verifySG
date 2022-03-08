import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm'

import { Call } from './call.entity'

@Entity({ name: 'mop' })
export class Mop {
  @PrimaryGeneratedColumn()
  id!: number

  @Column('varchar', { unique: true, nullable: false, length: 255 })
  nric!: string

  @Column('varchar', { nullable: true, length: 255 })
  phoneNumber!: string

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date

  @OneToMany(() => Call, (call) => call.mop)
  calls!: Call[]
}
