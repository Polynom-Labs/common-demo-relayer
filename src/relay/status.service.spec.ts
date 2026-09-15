import { toStatusDto, type RelayStatusDto } from './status-dto';
import type { RelayRequestEntity } from '../entities/relay-request.entity';

describe('relay status DTO', () => {
  it('matches createRelayApi RelayRequestStatus fields', () => {
    const dto: RelayStatusDto = toStatusDto({
      id: 'req-1',
      status: 'succeeded',
      packageJson: {},
      publicReason: 'send_failed',
      transactionHash: 'abc',
      currentAttemptNumber: 2,
      retryAllowed: true,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:01:00.000Z'),
    } as RelayRequestEntity);
    expect(dto).toEqual({
      relayRequestId: 'req-1',
      status: 'succeeded',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:01:00.000Z',
      retryAllowed: true,
      attemptNumber: 2,
      transactionHash: 'abc',
      publicReason: 'send_failed',
    });
  });
});
