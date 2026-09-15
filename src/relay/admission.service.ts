import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { RelayRequestEntity } from "../entities/relay-request.entity";
import { invalidPackageError } from "./http-error";
import { SubmitService } from "./submit.service";
import { importEsm } from "../config/import-esm";

type RelaySdk = typeof import("@arcanetech/privacy-sdk-relay");

let relaySdk: RelaySdk | undefined;

async function loadRelaySdk(): Promise<RelaySdk> {
  if (!relaySdk) {
    relaySdk = await importEsm<RelaySdk>("@arcanetech/privacy-sdk-relay");
  }
  return relaySdk;
}

export type RelayAccepted = {
  relayRequestId: string;
  status: string;
  createdAt: string;
  statusUrl: string;
};

@Injectable()
export class AdmissionService {
  constructor(
    @InjectRepository(RelayRequestEntity)
    private readonly requests: Repository<RelayRequestEntity>,
    private readonly submit: SubmitService,
  ) {}

  async admit(body: unknown): Promise<RelayAccepted> {
    const sdk = await loadRelaySdk();
    const decoded = sdk.deserializeRelayPackage(body);
    if (!decoded) {
      throw invalidPackageError();
    }
    const now = new Date();
    const request = this.requests.create({
      id: crypto.randomUUID(),
      status: sdk.RELAY_STATUS.accepted,
      packageJson: decoded as unknown as Record<string, unknown>,
      publicReason: null,
      transactionHash: null,
      currentAttemptNumber: 0,
      retryAllowed: false,
      createdAt: now,
      updatedAt: now,
    });
    await this.requests.save(request);
    this.submit.processInBackground(request.id);
    return {
      relayRequestId: request.id,
      status: request.status,
      createdAt: request.createdAt.toISOString(),
      statusUrl: `/api/relay-requests/${request.id}`,
    };
  }
}
