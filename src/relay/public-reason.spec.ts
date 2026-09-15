import { mapPublicReason } from "./public-reason";

describe("mapPublicReason", () => {
  it("maps pool NullifierUsed to nullifiers_spent", () => {
    expect(
      mapPublicReason("HostError: Error(Contract, #1)\nEvent log"),
    ).toBe("nullifiers_spent");
  });

  it("keeps kyt_rejected and send_failed", () => {
    expect(mapPublicReason("kyt_rejected")).toBe("kyt_rejected");
    expect(mapPublicReason("Unauthenticated KYT inspect request")).toBe(
      "kyt_rejected",
    );
    expect(mapPublicReason("send_failed")).toBe("send_failed");
  });
});
