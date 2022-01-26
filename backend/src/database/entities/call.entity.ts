import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  DeleteDateColumn,
  ManyToOne,
} from 'typeorm'

import { Officer } from './officer.entity'
import { Mop } from './mop.entity'

@Entity({ name: 'call' })
export class Call {
  @PrimaryGeneratedColumn()
  id!: number

  @ManyToOne(() => Officer, (officer) => officer.calls, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  officer!: Officer

  @ManyToOne(() => Mop, (mop) => mop.calls, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  mop!: Mop

  @CreateDateColumn()
  createdAt!: Date

  @DeleteDateColumn()
  deletedAt!: Date
}
