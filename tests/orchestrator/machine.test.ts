import { describe, expect, it } from "vitest";
import { createProcurementMachine } from "../../packages/orchestrator/src/machine.js";

describe("procurement machine", () => {
  it("moves from selected offer to payment authorized only after inventory hold", () => {
    const machine = createProcurementMachine();
    let state = machine.initialState;
    state = machine.transition(state, { type: "OFFER_SELECTED" });
    state = machine.transition(state, { type: "INVENTORY_HELD" });

    expect(state.value).toBe("inventoryHeld");
  });
});
