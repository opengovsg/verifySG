import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm'

@Entity({ name: 'officer' })
export class User {
  @PrimaryGeneratedColumn()
  id!: string

  @Column({ unique: true, nullable: false })
  name!: string

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date

  @UpdateDateColumn()
  deletedAt!: Date
}
