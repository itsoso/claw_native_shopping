import { describe, expect, it } from "vitest";
import { evaluateFulfillmentEvents } from "../../packages/fulfillment/src/watch.js";

describe("evaluateFulfillmentEvents", () => {
  it("flags a delayed shipment for exception handling", () => {
    const result = evaluateFulfillmentEvents({
      now: "2026-03-23T12:00:00+08:00",
      deadline: "2026-03-23T10:00:00+08:00",
      status: "in_transit"
    });

    expect(result.action).toBe("open_exception");
  });
});
