import { describe, expect, it } from "vitest";
import { buildServer } from "../../apps/api/src/server.js";

describe("buyer api", () => {
  it("returns an explanation for a known order", async () => {
    const app = buildServer();
    const response = await app.inject({
      method: "GET",
      url: "/orders/order_1/explanation"
    });

    expect(response.statusCode).toBe(200);
  });
});
