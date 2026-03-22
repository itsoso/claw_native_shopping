import { describe, expect, it, vi } from "vitest";
import { executeCheckout } from "../../packages/checkout/src/execute.js";

describe("executeCheckout", () => {
  it("authorizes payment after inventory hold and returns committed order", async () => {
    const payment = { authorize: vi.fn().mockResolvedValue({ approved: true }) };
    const seller = { commitOrder: vi.fn().mockResolvedValue({ orderId: "order_1" }) };

    const result = await executeCheckout({
      holdConfirmed: true,
      payment,
      seller
    });

    expect(result.orderId).toBe("order_1");
  });
});
