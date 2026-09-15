import { HttpException, HttpStatus } from '@nestjs/common';

export class RelayHttpError extends HttpException {
  constructor(reason: string, status: number) {
    super({ reason }, status);
  }
}

export const RELAY_HTTP = {
  ok: 200,
  accepted: 202,
  badRequest: 400,
  notFound: 404,
} as const;

export function invalidPackageError(): RelayHttpError {
  return new RelayHttpError('invalid_package', RELAY_HTTP.badRequest);
}

export function notFoundError(): RelayHttpError {
  return new RelayHttpError('not_found', RELAY_HTTP.notFound);
}

export function retryNotAllowedError(): RelayHttpError {
  return new RelayHttpError('retry_not_allowed', HttpStatus.CONFLICT);
}
