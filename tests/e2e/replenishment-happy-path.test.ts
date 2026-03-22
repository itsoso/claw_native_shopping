import { describe, expect, it } from "vitest";
import { runProcurementScenario } from "../../packages/orchestrator/src/service.js";
import { happyPathScenario } from "../fixtures/happy-path-scenario.js";

describe("replenishment happy path", () => {
  it("commits an order end to end", async () => {
    const result = await runProcurementScenario(happyPathScenario);

    expect(result.status).toBe("orderCommitted");
    expect(result.explanation).toContain("ORDER_COMMITTED");
  });
});
