import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  ManyToOne,
  UpdateDateColumn,
} from 'typeorm'

import { Call } from './call.entity'
import { Agency } from './agency.entity'

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

  @ManyToOne(() => Agency, (agency) => agency.officers, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  agency!: Agency

  @OneToMany(() => Call, (call) => call.officer)
  calls!: Call[]

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}
