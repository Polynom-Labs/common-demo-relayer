import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'relay_attempts' })
export class RelayAttemptEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('text')
  relayRequestId!: string;

  @Column('int')
  attemptNumber!: number;

  @Column('text')
  status!: string;

  @Column({ type: 'text', nullable: true })
  transactionHash!: string | null;

  @Column({ type: 'text', nullable: true })
  publicReason!: string | null;

  @Column({ type: 'timestamptz' })
  createdAt!: Date;
}
