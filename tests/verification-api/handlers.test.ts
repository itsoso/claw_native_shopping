import { describe, expect, it } from "vitest";

import { buildVerificationServer } from "../../apps/verification-api/src/server.js";

describe("verification-api handlers", () => {
  it("GET /health returns ok", async () => {
    const app = buildVerificationServer();
    const response = await app.inject({ method: "GET", url: "/health" });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: "ok", service: "verification-api" });
  });

  it("POST /v0.1/products/search returns products", async () => {
    const app = buildVerificationServer();
    const response = await app.inject({
      method: "POST",
      url: "/v0.1/products/search",
      payload: {},
    });
    expect(response.statusCode).toBe(200);
    const body = response.json() as { products: unknown[] };
    expect(body.products.length).toBeGreaterThan(0);
  });

  it("POST /v0.1/products/search filters by category", async () => {
    const app = buildVerificationServer();
    const response = await app.inject({
      method: "POST",
      url: "/v0.1/products/search",
      payload: { category: "food.tea" },
    });
    const body = response.json() as { products: Array<{ category: string }> };
    for (const product of body.products) {
      expect(product.category).toMatch(/^food\.tea/);
    }
  });

  it("POST /v0.1/products/search filters by has_verification", async () => {
    const app = buildVerificationServer();
    const response = await app.inject({
      method: "POST",
      url: "/v0.1/products/search",
      payload: { has_verification: true },
    });
    const body = response.json() as { products: Array<{ verified: boolean }> };
    for (const product of body.products) {
      expect(product.verified).toBe(true);
    }
  });

  it("GET /v0.1/products/:skuId returns product detail", async () => {
    const app = buildVerificationServer();
    const response = await app.inject({
      method: "GET",
      url: "/v0.1/products/ks_beef_001",
    });
    expect(response.statusCode).toBe(200);
    const body = response.json() as { skuId: string; name: string; verificationReport: { verified: boolean } };
    expect(body.skuId).toBe("ks_beef_001");
    expect(body.name).toContain("牛肉干");
    expect(body.verificationReport.verified).toBe(true);
  });

  it("GET /v0.1/products/unknown returns 404", async () => {
    const app = buildVerificationServer();
    const response = await app.inject({
      method: "GET",
      url: "/v0.1/products/nonexistent",
    });
    expect(response.statusCode).toBe(404);
  });

  it("GET /v0.1/products/:skuId/verification returns verification report", async () => {
    const app = buildVerificationServer();
    const response = await app.inject({
      method: "GET",
      url: "/v0.1/products/ks_rice_003/verification",
    });
    expect(response.statusCode).toBe(200);
    const body = response.json() as { skuId: string; verified: boolean; records: unknown[] };
    expect(body.skuId).toBe("ks_rice_003");
    expect(body.verified).toBe(true);
    expect(body.records.length).toBeGreaterThan(0);
  });

  it("POST /v0.1/verification/request returns matched result", async () => {
    const app = buildVerificationServer();
    const response = await app.inject({
      method: "POST",
      url: "/v0.1/verification/request",
      payload: {
        skuId: "ks_new_001",
        verificationType: "expert_inspection",
        urgency: "standard",
        aspects: ["quality", "authenticity"],
      },
    });
    expect(response.statusCode).toBe(200);
    const body = response.json() as { requestId: string; status: string; costCents: number };
    expect(body.status).toBe("matched");
    expect(body.requestId).toBe("vreq_ks_new_001");
    expect(body.costCents).toBe(3000);
  });

  it("POST /v0.1/verification/request rejects invalid payload", async () => {
    const app = buildVerificationServer();
    const response = await app.inject({
      method: "POST",
      url: "/v0.1/verification/request",
      payload: { skuId: "test" },
    });
    expect(response.statusCode).toBe(400);
  });
});
