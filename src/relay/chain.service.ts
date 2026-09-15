import { Injectable } from "@nestjs/common";
import {
  Account,
  Address,
  Contract,
  Keypair,
  nativeToScVal,
  rpc,
  TransactionBuilder,
} from "@stellar/stellar-sdk";
import { loadRelayerEnv } from "../config/env";

const TX_TIMEOUT_SECONDS = 30;
const BASE_FEE = "100";
const CONFIRM_POLL_MS = 400;
const CONFIRM_ATTEMPTS = 60;

@Injectable()
export class ChainService {
  private readonly env = loadRelayerEnv();
  private readonly server = new rpc.Server(this.env.sorobanRpcUrl, {
    allowHttp: this.env.sorobanRpcUrl.startsWith("http://"),
  });

  getServer(): rpc.Server {
    return this.server;
  }

  async getAccount(publicKey: string): Promise<Account> {
    return this.server.getAccount(publicKey);
  }

  async currentLedger(): Promise<number> {
    const latest = await this.server.getLatestLedger();
    return latest.sequence;
  }

  async assembleAndSend(input: {
    keypair: Keypair;
    poolContract: string;
    zkConfigNonce: bigint;
    proofBytes: Buffer;
    publicSignals: Buffer;
    ciphertextBytes: Buffer;
    kytExpirationLedger: number;
    kytSignature: Buffer;
  }): Promise<string> {
    const account = await this.server.getAccount(input.keypair.publicKey());
    const operation = new Contract(input.poolContract).call(
      "transact",
      new Address(input.keypair.publicKey()).toScVal(),
      nativeToScVal(input.zkConfigNonce, { type: "u64" }),
      nativeToScVal(input.proofBytes, { type: "bytes" }),
      nativeToScVal(input.publicSignals, { type: "bytes" }),
      nativeToScVal(input.ciphertextBytes, { type: "bytes" }),
      nativeToScVal(
        {
          expiration_ledger: input.kytExpirationLedger,
          signature: input.kytSignature,
        },
        {
          type: {
            expiration_ledger: ["symbol", "u32"],
            signature: ["symbol", "bytes"],
          },
        },
      ),
    );
    const built = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: this.env.networkPassphrase,
    })
      .addOperation(operation)
      .setTimeout(TX_TIMEOUT_SECONDS)
      .build();
    const simulated = await this.server.simulateTransaction(built);
    if (rpc.Api.isSimulationError(simulated)) {
      throw new Error(simulated.error);
    }
    const prepared = rpc.assembleTransaction(built, simulated).build();
    prepared.sign(input.keypair);
    const sent = await this.server.sendTransaction(prepared);
    if (sent.status === "ERROR") {
      throw new Error("send_failed");
    }
    return sent.hash;
  }

  async waitForSuccess(
    hash: string,
    attempts = CONFIRM_ATTEMPTS,
  ): Promise<void> {
    for (let index = 0; index < attempts; index += 1) {
      const result = await this.server.getTransaction(hash);
      if (result.status === rpc.Api.GetTransactionStatus.SUCCESS) {
        return;
      }
      if (result.status === rpc.Api.GetTransactionStatus.FAILED) {
        throw new Error("transaction_failed");
      }
      await new Promise((resolve) => {
        setTimeout(resolve, CONFIRM_POLL_MS);
      });
    }
    throw new Error("transaction_failed");
  }

  async fundRelayer(publicKey: string): Promise<void> {
    const url = `${this.env.friendbotUrl}?addr=${encodeURIComponent(publicKey)}`;
    const response = await fetch(url);
    if (response.ok) {
      return;
    }
    if (response.status === 400) {
      return;
    }
    throw new Error(`Friendbot error: ${String(response.status)}`);
  }
}
