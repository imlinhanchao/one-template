import { describe, it, expect } from "vitest";
import { SDK } from "./index";

describe("SDK", () => {
  it("should return 'Hello from SDK' when calling hello()", () => {
    const sdk = new SDK();
    expect(sdk.hello()).toBe("Hello from SDK");
  });
});