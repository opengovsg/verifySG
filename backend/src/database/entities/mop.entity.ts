import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm'

@Entity({ name: 'mop' })
export class Mop {
  @PrimaryGeneratedColumn()
  id!: number

  @Column('varchar', { unique: true, nullable: false, length: 255 })
  nric!: string

  @CreateDateColumn()
  createdAt!: Date
}
