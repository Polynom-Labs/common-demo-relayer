import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RelayRequestEntity } from '../entities/relay-request.entity';
import { notFoundError, retryNotAllowedError } from './http-error';
import { SubmitService } from './submit.service';
import { toStatusDto, type RelayStatusDto } from './status-dto';

export type { RelayStatusDto } from './status-dto';

@Injectable()
export class StatusService {
  constructor(
    @InjectRepository(RelayRequestEntity)
    private readonly requests: Repository<RelayRequestEntity>,
    private readonly submit: SubmitService,
  ) {}

  async read(relayRequestId: string): Promise<RelayStatusDto> {
    const request = await this.requests.findOneBy({ id: relayRequestId });
    if (!request) {
      throw notFoundError();
    }
    return toStatusDto(request);
  }

  async retry(relayRequestId: string): Promise<RelayStatusDto> {
    const request = await this.requests.findOneBy({ id: relayRequestId });
    if (!request) {
      throw notFoundError();
    }
    if (!request.retryAllowed) {
      throw retryNotAllowedError();
    }
    this.submit.processInBackground(request.id);
    return this.read(relayRequestId);
  }
}
