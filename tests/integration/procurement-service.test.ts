import { describe, expect, it } from "vitest";
import { runProcurementScenario } from "../../packages/orchestrator/src/service.js";

describe("procurement service", () => {
  it("runs demand to committed order using mocked ports", async () => {
    const result = await runProcurementScenario();
    expect(result.status).toBe("orderCommitted");
  });
});
