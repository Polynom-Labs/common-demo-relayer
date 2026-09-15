import { kytInspectHeaders } from "./kyt-inspect-headers";

describe("kytInspectHeaders", () => {
  it("omits Authorization when the token is missing or blank", () => {
    expect(kytInspectHeaders()).not.toHaveProperty("authorization");
    expect(kytInspectHeaders("")).not.toHaveProperty("authorization");
    expect(kytInspectHeaders("   ")).not.toHaveProperty("authorization");
  });

  it("sends Bearer only when a token is present", () => {
    expect(kytInspectHeaders("stand-token")).toEqual({
      "content-type": "application/json",
      authorization: "Bearer stand-token",
    });
  });
});
