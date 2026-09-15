import { Injectable } from "@nestjs/common";
import { loadRelayerEnv } from "../config/env";
import { ChainService } from "./chain.service";
import { kytInspectHeaders } from "./kyt-inspect-headers";

export type KytApproval = {
  signature: Buffer;
  expiresAtLedger: number;
};

@Injectable()
export class KytInspectService {
  private readonly env = loadRelayerEnv();

  constructor(private readonly chain: ChainService) {}

  async inspect(input: {
    owner: string;
    proofBytes: string;
    publicSignals: string;
    ciphertextBytes?: string;
    outputNoteEphemeralScalars?: string[];
    applicationIdHints: string[];
    zkConfigNonce: string;
  }): Promise<KytApproval> {
    const currentLedger = await this.chain.currentLedger();
    const headers = kytInspectHeaders(this.env.kytInspectToken);
    const body: Record<string, unknown> = {
      owner: input.owner,
      poolContract: this.env.poolContract,
      kytRegistry: this.env.kytPassageRegistryContract,
      proofBytes: input.proofBytes,
      publicSignalsBytes: input.publicSignals,
      applicationIdsPlaintext: input.applicationIdHints,
      nonce: crypto.randomUUID(),
      zkConfigNonce: input.zkConfigNonce,
      currentLedger,
    };
    if (input.ciphertextBytes !== undefined) {
      body.ciphertextBytes = input.ciphertextBytes;
    }
    if (input.outputNoteEphemeralScalars) {
      body.outputNoteEphemeralScalars = input.outputNoteEphemeralScalars;
    }
    const response = await fetch(
      `${this.env.kytApiBaseUrl}/kyt/passages/inspect`,
      {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      },
    );
    const text = await response.text();
    let payload: {
      status?: string;
      signature?: string;
      expiresAtLedger?: number;
      reasonCode?: string;
      message?: string;
    };
    try {
      payload = JSON.parse(text) as typeof payload;
    } catch {
      throw new Error(
        `kyt_rejected: inspect returned non-JSON (HTTP ${String(response.status)})`,
      );
    }
    if (!response.ok || payload.status !== "approved" || !payload.signature) {
      throw new Error(payload.reasonCode ?? payload.message ?? "kyt_rejected");
    }
    return {
      signature: Buffer.from(payload.signature, "base64"),
      expiresAtLedger: payload.expiresAtLedger ?? currentLedger + 100,
    };
  }
}
