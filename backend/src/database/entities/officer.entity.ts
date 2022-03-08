import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  UpdateDateColumn,
} from 'typeorm'

import { Call } from './call.entity'

@Entity({ name: 'officer' })
export class Officer {
  @PrimaryGeneratedColumn()
  id!: number

  @Column('varchar', { unique: true, nullable: false, length: 255 })
  email!: string

  @Column('varchar', { nullable: true, length: 255 })
  name!: string

  @Column('varchar', { nullable: true, length: 255 })
  position!: string

  @Column('varchar', { length: 255, nullable: true })
  agency!: string

  @OneToMany(() => Call, (call) => call.officer)
  calls!: Call[]

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}
