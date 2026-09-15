import { Controller, Get, HttpCode, Param, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { AdmissionService } from './admission.service';
import { RELAY_HTTP } from './http-error';
import { StatusService } from './status.service';

@Controller(['api/relay-requests', 'relay-requests'])
export class RelayController {
  constructor(
    private readonly admission: AdmissionService,
    private readonly status: StatusService,
  ) {}

  @Post()
  @HttpCode(RELAY_HTTP.accepted)
  async create(@Req() request: Request) {
    return this.admission.admit(request.body);
  }

  @Get(':relayRequestId')
  async read(@Param('relayRequestId') relayRequestId: string) {
    return this.status.read(relayRequestId);
  }

  @Post(':relayRequestId/attempts')
  @HttpCode(RELAY_HTTP.ok)
  async retry(@Param('relayRequestId') relayRequestId: string) {
    return this.status.retry(relayRequestId);
  }
}
