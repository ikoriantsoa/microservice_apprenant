import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import * as dayjs from 'dayjs';
import { ICryptage } from 'src/cryptage/interface/ICryptage';

@Entity('apprenants')
export class ApprenantEntity {
  @PrimaryGeneratedColumn('uuid')
  apprenant_id: string;

  @Column({ nullable: false })
  keycloak_id: string;

  @Column({ type: 'jsonb', nullable: false, unique: true })
  username: ICryptage;

  @Column({ type: 'jsonb', nullable: false, unique: true })
  email: ICryptage;

  @Column({ type: 'jsonb', nullable: false })
  lastname: ICryptage;

  @Column({ type: 'jsonb', nullable: false })
  firstname: ICryptage;

  @Column({ type: 'jsonb', nullable: false })
  adresse: ICryptage;

  @Column({ type: 'boolean', nullable: false, default: true })
  partage: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp with time zone' })
  deletedAt: Date;

  get readableCreatedAt(): string {
    return dayjs(this.createdAt).format('DD/MM/YY HH:mm:ss');
  }

  get readableUpdatedAt(): string {
    return dayjs(this.updatedAt).format('DD/MM/YY HH:mm:ss');
  }

  get readableDeletedAt(): string {
    return dayjs(this.deletedAt).format('DD/MM/YY HH:mm:ss');
  }
}
