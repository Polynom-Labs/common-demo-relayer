import { Keypair } from "@stellar/stellar-sdk";
import { deriveSep0005Seed } from "./hd-seed";

export function deriveStellarKeypair(mnemonic: string, index = 0): Keypair {
  return Keypair.fromRawEd25519Seed(deriveSep0005Seed(mnemonic, index));
}

export function relayerKeypairFromEnv(input: {
  mnemonic?: string;
  secret?: string;
}): Keypair {
  if (input.secret) {
    return Keypair.fromSecret(input.secret);
  }
  if (!input.mnemonic) {
    throw new Error("Set RELAYER_SECRET or RELAYER_MNEMONIC");
  }
  return deriveStellarKeypair(input.mnemonic, 0);
}
