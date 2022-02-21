import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  DeleteDateColumn,
  UpdateDateColumn,
} from 'typeorm'

import { Call } from './call.entity'

@Entity({ name: 'officer' })
export class Officer {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ unique: true, nullable: false, length: 255 })
  email!: string

  @Column({ nullable: true })
  name!: string

  @Column('varchar', { length: 255, nullable: true })
  position!: string

  @Column('varchar', { length: 255, nullable: true })
  agency!: string

  @OneToMany(() => Call, (call) => call.officer)
  calls!: Call[]

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date

  @DeleteDateColumn({ nullable: true })
  deletedAt!: Date
}
