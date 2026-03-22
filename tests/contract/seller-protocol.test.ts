import { describe, expect, it } from "vitest";
import { RFQSchema } from "../../packages/seller-protocol/src/messages.js";

describe("seller protocol", () => {
  it("parses a basic RFQ", () => {
    const value = RFQSchema.parse({
      rfqId: "rfq_1",
      buyerAgentId: "buyer_1",
      category: "eggs",
      quantity: 2
    });

    expect(value.rfqId).toBe("rfq_1");
  });
});
