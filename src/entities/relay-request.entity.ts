import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'relay_requests' })
export class RelayRequestEntity {
  @PrimaryColumn('text')
  id!: string;

  @Column('text')
  status!: string;

  @Column({ type: 'jsonb' })
  packageJson!: Record<string, unknown>;

  @Column({ type: 'text', nullable: true })
  publicReason!: string | null;

  @Column({ type: 'text', nullable: true })
  transactionHash!: string | null;

  @Column({ type: 'int', default: 0 })
  currentAttemptNumber!: number;

  @Column({ type: 'boolean', default: false })
  retryAllowed!: boolean;

  @Column({ type: 'timestamptz' })
  createdAt!: Date;

  @Column({ type: 'timestamptz' })
  updatedAt!: Date;
}
