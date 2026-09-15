import { requireDecimalApplicationId } from "./env";

describe("requireDecimalApplicationId", () => {
  it("accepts association.audit_id as decimal Fr", () => {
    expect(requireDecimalApplicationId("3520878299009890")).toBe(
      "3520878299009890",
    );
  });

  it("rejects a Compliance UUID or foreignId", () => {
    expect(() =>
      requireDecimalApplicationId("b7f25daa-aeff-4f93-b33e-0cd905f0bab9"),
    ).toThrow(/decimal Fr/);
  });
});
