import { describe, expect, it } from "vitest";

import {
  DEFAULT_SELLER_SIM_BASE_URL,
  resolveSellerRuntime,
} from "../../apps/api/src/sellerRuntime.js";

describe("seller runtime resolution", () => {
  it("uses the default seller base URL and creates HTTP runtime adapters", () => {
    const runtime = resolveSellerRuntime();

    expect(runtime.sellerBaseUrl).toBe(DEFAULT_SELLER_SIM_BASE_URL);
    expect(typeof runtime.sellerPort.requestQuote).toBe("function");
    expect(typeof runtime.sellerPort.holdInventory).toBe("function");
    expect(typeof runtime.sellerPort.commitOrder).toBe("function");
    expect(typeof runtime.quoteCollector?.collectBestQuote).toBe("function");
  });

  it("does not create a default quote collector when an explicit seller port is injected", () => {
    const runtime = resolveSellerRuntime({
      sellerPort: {
        async requestQuote() {
          throw new Error("not_used");
        },
        async holdInventory() {
          throw new Error("not_used");
        },
        async commitOrder() {
          throw new Error("not_used");
        },
      },
    });

    expect(runtime.sellerBaseUrl).toBe(DEFAULT_SELLER_SIM_BASE_URL);
    expect(runtime.quoteCollector).toBeUndefined();
  });

  it("keeps the HTTP quote collector when a seller base URL is explicitly provided", () => {
    const runtime = resolveSellerRuntime({
      sellerBaseUrl: "http://127.0.0.1:4100",
      sellerPort: {
        async requestQuote() {
          throw new Error("not_used");
        },
        async holdInventory() {
          throw new Error("not_used");
        },
        async commitOrder() {
          throw new Error("not_used");
        },
      },
    });

    expect(runtime.sellerBaseUrl).toBe("http://127.0.0.1:4100");
    expect(typeof runtime.quoteCollector?.collectBestQuote).toBe("function");
  });
});
