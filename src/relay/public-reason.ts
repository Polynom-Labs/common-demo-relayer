export function mapPublicReason(reason: string): string {
  const normalized = reason.toLowerCase();
  if (
    reason === "kyt_rejected" ||
    normalized.includes("kyt_") ||
    normalized.includes("inspect") ||
    normalized.includes("unauthenticated")
  ) {
    return "kyt_rejected";
  }
  if (reason === "send_failed" || reason === "transaction_failed") {
    return reason;
  }
  if (normalized.includes("unsupported_pool")) {
    return "unsupported_pool";
  }
  if (
    normalized.includes("contract, #1") ||
    normalized.includes("nullifierused") ||
    normalized.includes("nullifier")
  ) {
    return "nullifiers_spent";
  }
  if (normalized.includes("hosterror") || normalized.includes("simulation")) {
    return "simulation_failed";
  }
  return "infrastructure_failed";
}
