import type { RelayRequestEntity } from '../entities/relay-request.entity';

export type RelayStatusDto = {
  relayRequestId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  retryAllowed: boolean;
  attemptNumber?: number;
  transactionHash?: string;
  publicReason?: string;
};

export function toStatusDto(request: RelayRequestEntity): RelayStatusDto {
  const dto: RelayStatusDto = {
    relayRequestId: request.id,
    status: request.status,
    createdAt: request.createdAt.toISOString(),
    updatedAt: request.updatedAt.toISOString(),
    retryAllowed: request.retryAllowed,
  };
  if (request.currentAttemptNumber > 0) {
    dto.attemptNumber = request.currentAttemptNumber;
  }
  if (request.transactionHash) {
    dto.transactionHash = request.transactionHash;
  }
  if (request.publicReason) {
    dto.publicReason = request.publicReason;
  }
  return dto;
}
