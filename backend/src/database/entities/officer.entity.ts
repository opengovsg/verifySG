import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  ManyToOne,
  UpdateDateColumn,
} from 'typeorm'

import { Notification } from './notification.entity'
import { Agency } from './agency.entity'

/*
 * Considered whether to enforce Capital Case for names and positions
 * but ultimately decided against it because of possible edge cases like
 * 'Md bin Abdul' or 'Officer of the Sea'
 * Also considered whether to remove punctuation marks, but possible edge cases like
 * "Frank D'souza" or 'Officer, Hougang NPC'
 * Hence, just trimming whitespace and replacing multiple whitespace with single space
 * */
const normalizeName = (name: string): string => {
  return name.trim().replace(/\s\s+/g, ' ')
}

const normalizePosition = (position: string): string => {
  return position.trim().replace(/\s\s+/g, ' ')
}

@Entity({ name: 'officer' })
export class Officer {
  @PrimaryGeneratedColumn()
  id: number

  @Column('varchar', {
    unique: true,
    nullable: false,
    length: 255,
    transformer: {
      // ensure email address is always lowercase
      to: (value: string) => value.toLowerCase(),
      from: (value: string) => value,
    },
  })
  email: string

  @Column('varchar', {
    nullable: true,
    length: 255,
    transformer: {
      // ensure name is normalized
      to: (value: string) => normalizeName(value),
      from: (value: string) => normalizeName(value),
    },
  })
  name: string

  @Column('varchar', {
    nullable: true,
    length: 255,
    transformer: {
      // ensure position is normalized
      to: (value: string) => normalizePosition(value),
      from: (value: string) => normalizePosition(value),
    },
  })
  position: string

  @ManyToOne(() => Agency, (agency) => agency.officers, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  agency: Agency

  @OneToMany(() => Notification, (notification) => notification.officer)
  notifications: Notification[]

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date
}
