import { describe, expect, it } from "vitest";

import { startApiServer } from "../../apps/api/src/server.js";
import { startSellerSimServer } from "../../apps/seller-sim/src/server.js";

describe("service health routes", () => {
  it("exposes simple health probes for api and seller sim", async () => {
    const [{ app: api, baseUrl: apiBaseUrl }, { app: seller, baseUrl: sellerBaseUrl }] =
      await Promise.all([startApiServer({ port: 0 }), startSellerSimServer({ port: 0 })]);

    try {
      const [apiResponse, sellerResponse] = await Promise.all([
        fetch(`${apiBaseUrl}/health`).then((response) => response.json()),
        fetch(`${sellerBaseUrl}/health`).then((response) => response.json()),
      ]);

      expect(apiResponse).toEqual({ status: "ok", service: "buyer-api" });
      expect(sellerResponse).toEqual({ status: "ok", service: "seller-sim" });
    } finally {
      await Promise.all([api.close(), seller.close()]);
    }
  });
});
