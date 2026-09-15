import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { loadRelayerEnv } from "../config/env";
import { RelayAttemptEntity } from "../entities/relay-attempt.entity";
import { RelayRequestEntity } from "../entities/relay-request.entity";
import { ChainService } from "./chain.service";
import { relayerKeypairFromEnv } from "./hd-wallet";
import { KytInspectService } from "./kyt.service";
import { mapPublicReason } from "./public-reason";

const RELAY_STATUS = {
  accepted: "accepted",
  validating: "validating",
  queued: "queued",
  submitted: "submitted",
  succeeded: "succeeded",
  rejected: "rejected",
  failed: "failed",
} as const;

type RelayPackage = {
  version: number;
  poolSelector: string;
  zkConfigNonce: string;
  proofBytes: string;
  publicSignals: string;
  applicationIdHints: string[];
  ciphertextBytes?: string;
  outputNoteEphemeralScalars?: string[];
};

@Injectable()
export class SubmitService implements OnModuleInit {
  private readonly logger = new Logger(SubmitService.name);
  private readonly env = loadRelayerEnv();
  private readonly keypair = relayerKeypairFromEnv({
    ...(this.env.relayerMnemonic ? { mnemonic: this.env.relayerMnemonic } : {}),
    ...(this.env.relayerSecret ? { secret: this.env.relayerSecret } : {}),
  });

  constructor(
    @InjectRepository(RelayRequestEntity)
    private readonly requests: Repository<RelayRequestEntity>,
    @InjectRepository(RelayAttemptEntity)
    private readonly attempts: Repository<RelayAttemptEntity>,
    private readonly chain: ChainService,
    private readonly kyt: KytInspectService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.chain.fundRelayer(this.keypair.publicKey());
    this.logger.log(`Relayer account ${this.keypair.publicKey()}`);
  }

  processInBackground(requestId: string): void {
    void this.process(requestId).catch((error: unknown) => {
      this.logger.error(
        `Relay request ${requestId} failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    });
  }

  async process(requestId: string): Promise<void> {
    const request = await this.requests.findOneBy({ id: requestId });
    if (!request) {
      return;
    }
    const now = new Date();
    request.status = RELAY_STATUS.validating;
    request.updatedAt = now;
    await this.requests.save(request);

    const pkg = request.packageJson as RelayPackage;
    if (pkg.poolSelector !== this.env.poolContract) {
      await this.finish(
        request,
        RELAY_STATUS.rejected,
        "unsupported_pool",
        false,
      );
      return;
    }

    const attemptNumber = request.currentAttemptNumber + 1;
    const attempt = this.attempts.create({
      relayRequestId: request.id,
      attemptNumber,
      status: "pending",
      transactionHash: null,
      publicReason: null,
      createdAt: new Date(),
    });
    await this.attempts.save(attempt);
    request.currentAttemptNumber = attemptNumber;
    request.status = RELAY_STATUS.queued;
    request.updatedAt = new Date();
    await this.requests.save(request);

    try {
      const approval = await this.kyt.inspect({
        owner: this.keypair.publicKey(),
        proofBytes: pkg.proofBytes,
        publicSignals: pkg.publicSignals,
        applicationIdHints: pkg.applicationIdHints,
        zkConfigNonce: pkg.zkConfigNonce,
        ...(pkg.ciphertextBytes === undefined
          ? {}
          : { ciphertextBytes: pkg.ciphertextBytes }),
        ...(pkg.outputNoteEphemeralScalars
          ? { outputNoteEphemeralScalars: pkg.outputNoteEphemeralScalars }
          : {}),
      });
      const hash = await this.chain.assembleAndSend({
        keypair: this.keypair,
        poolContract: pkg.poolSelector,
        zkConfigNonce: BigInt(pkg.zkConfigNonce),
        proofBytes: Buffer.from(pkg.proofBytes, "hex"),
        publicSignals: Buffer.from(pkg.publicSignals, "hex"),
        ciphertextBytes: Buffer.from(pkg.ciphertextBytes ?? "", "hex"),
        kytExpirationLedger: approval.expiresAtLedger,
        kytSignature: approval.signature,
      });
      request.status = RELAY_STATUS.submitted;
      request.transactionHash = hash;
      request.updatedAt = new Date();
      await this.requests.save(request);
      attempt.transactionHash = hash;
      await this.attempts.save(attempt);
      await this.chain.waitForSuccess(hash);
      attempt.status = "succeeded";
      await this.attempts.save(attempt);
      await this.finish(request, RELAY_STATUS.succeeded, null, false, hash);
    } catch (error: unknown) {
      const reason =
        error instanceof Error ? error.message : "infrastructure_failed";
      this.logger.error(
        `Relay request ${requestId} failed: ${reason.slice(0, 1500)}`,
      );
      const mapped = mapPublicReason(reason);
      attempt.status = "failed";
      attempt.publicReason = mapped;
      await this.attempts.save(attempt);
      const retryAllowed =
        mapped === "send_failed" ||
        mapped === "transaction_failed" ||
        mapped === "infrastructure_failed";
      await this.finish(
        request,
        retryAllowed ? RELAY_STATUS.failed : RELAY_STATUS.rejected,
        mapped,
        retryAllowed,
      );
    }
  }

  private async finish(
    request: RelayRequestEntity,
    status: string,
    publicReason: string | null,
    retryAllowed: boolean,
    transactionHash?: string,
  ): Promise<void> {
    request.status = status;
    request.publicReason = publicReason;
    request.retryAllowed = retryAllowed;
    request.updatedAt = new Date();
    if (transactionHash) {
      request.transactionHash = transactionHash;
    }
    await this.requests.save(request);
  }
}
