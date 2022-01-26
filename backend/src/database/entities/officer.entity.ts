import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm'

import { Call } from './call.entity'

@Entity({ name: 'officer' })
export class Officer {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ unique: true, nullable: false, length: 255 })
  email!: string

  @Column({ nullable: false })
  name!: string

  @Column()
  position!: string

  @Column('text')
  agency!: string

  @OneToMany(() => Call, (call) => call.officer)
  calls!: Call[]

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date

  @DeleteDateColumn()
  deletedAt!: Date
}
