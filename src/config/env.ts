export function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing ${name} environment variable`);
  }
  return value;
}

export function optionalEnv(name: string, fallback: string): string {
  const value = process.env[name]?.trim();
  return value && value.length > 0 ? value : fallback;
}

export function optionalNonEmptyEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value && value.length > 0 ? value : undefined;
}

const DECIMAL_APPLICATION_ID = /^\d+$/u;

export function requireDecimalApplicationId(value: string): string {
  if (!DECIMAL_APPLICATION_ID.test(value)) {
    throw new Error(
      "APPLICATION_ID must be association.audit_id (decimal Fr), not a UUID or foreignId.",
    );
  }
  return value;
}

export type RelayerEnv = {
  port: number;
  databaseUrl: string;
  relayerMnemonic: string | undefined;
  relayerSecret: string | undefined;
  networkPassphrase: string;
  sorobanRpcUrl: string;
  friendbotUrl: string;
  poolContract: string;
  kytPassageRegistryContract: string;
  kytApiBaseUrl: string;
  kytInspectToken: string | undefined;
  applicationId: string;
  zkConfigNonce: bigint;
};

export function loadRelayerEnv(): RelayerEnv {
  const token = optionalNonEmptyEnv("KYT_INSPECT_TOKEN");
  const secret = process.env.RELAYER_SECRET?.trim();
  const mnemonic = process.env.RELAYER_MNEMONIC?.trim();
  if (!secret && !mnemonic) {
    throw new Error(
      "Missing RELAYER_SECRET or RELAYER_MNEMONIC environment variable",
    );
  }
  return {
    port: Number.parseInt(optionalEnv("PORT", "3010"), 10),
    databaseUrl: requiredEnv("DATABASE_URL"),
    ...(secret ? { relayerSecret: secret } : { relayerSecret: undefined }),
    ...(mnemonic
      ? { relayerMnemonic: mnemonic }
      : { relayerMnemonic: undefined }),
    networkPassphrase: optionalEnv(
      "STELLAR_NETWORK_PASSPHRASE",
      "Test SDF Network ; September 2015",
    ),
    sorobanRpcUrl: optionalEnv(
      "SOROBAN_RPC_URL",
      "https://soroban-testnet.stellar.org",
    ),
    friendbotUrl: optionalEnv("FRIENDBOT_URL", "https://friendbot.stellar.org"),
    poolContract: requiredEnv("POOL_CONTRACT"),
    kytPassageRegistryContract: requiredEnv("KYT_PASSAGE_REGISTRY_CONTRACT"),
    kytApiBaseUrl: requiredEnv("KYT_API_BASE_URL").replace(/\/$/u, ""),
    ...(token ? { kytInspectToken: token } : { kytInspectToken: undefined }),
    applicationId: requireDecimalApplicationId(requiredEnv("APPLICATION_ID")),
    zkConfigNonce: BigInt(optionalEnv("ZK_CONFIG_NONCE", "3")),
  };
}
