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

  @Column({ unique: true, nullable: false })
  name!: string

  @Column({ unique: true, nullable: false, length: 255 })
  email!: string

  @Column('text')
  agency!: string

  @OneToMany(() => Call, (call) => call.officer)
  calls!: Call[]

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date

  @UpdateDateColumn()
  deletedAt!: Date
}
