// @vitest-environment jsdom

import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { App } from "../../apps/web/src/app/App.js";
import type {
  DemoApiClient,
  ReplenishmentResult
} from "../../apps/web/src/lib/types.js";

const successfulResult: ReplenishmentResult = {
  status: "orderCommitted",
  orderId: "order_intent_egg-12",
  explanation: [
    "INTENT_CREATED",
    "QUOTE_SELECTED",
    "POLICY_EVALUATED",
    "INVENTORY_HELD",
    "PAYMENT_AUTHORIZED",
    "ORDER_COMMITTED"
  ],
  snapshot: {
    orderId: "order_intent_egg-12",
    status: "fulfillmentStarted",
    scenarioId: "home",
    category: "eggs",
    sellerAgentId: "farmhouse_hub",
    totalAmount: 20
  }
};

const createClient = (): DemoApiClient => ({
  runReplenishment: vi.fn().mockResolvedValue(successfulResult),
  fetchOrderExplanation: vi.fn()
});

describe("procurement flow", () => {
  it("shows the user-facing timeline and order summary after a successful run", async () => {
    render(<App client={createClient()} />);

    fireEvent.click(screen.getByRole("button", { name: "为这个家发起自动补货" }));

    await waitFor(() => {
      expect(screen.getByText("已为你的家庭提交一笔补货订单")).toBeTruthy();
    });

    expect(screen.getByText("需求已生成")).toBeTruthy();
    expect(screen.getByText("报价已锁定")).toBeTruthy();
    expect(screen.getByText("订单已提交")).toBeTruthy();
    expect(screen.getByText("farmhouse_hub")).toBeTruthy();
    expect(screen.getByText("¥20")).toBeTruthy();
  });
});
