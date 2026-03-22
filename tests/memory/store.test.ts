import { describe, expect, it } from "vitest";
import { createMemoryStore } from "../../packages/memory/src/store.js";

describe("memory store", () => {
  it("persists and returns audit events for an order", () => {
    const store = createMemoryStore();
    store.appendAuditEvent("order_1", { type: "QUOTE_SELECTED" });

    expect(store.getAuditEvents("order_1")).toHaveLength(1);
  });
});
