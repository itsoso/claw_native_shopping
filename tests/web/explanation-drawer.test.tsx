// @vitest-environment jsdom

import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { App } from "../../apps/web/src/app/App.js";
import {
  ApiUnavailableError
} from "../../apps/web/src/lib/api.js";
import type {
  DemoApiClient,
  OrderExplanationPayload,
  ReplenishmentResult
} from "../../apps/web/src/lib/types.js";

const successResult: ReplenishmentResult = {
  status: "orderCommitted",
  orderId: "order_intent_egg-12",
  explanation: ["INTENT_CREATED", "ORDER_COMMITTED"],
  snapshot: {
    orderId: "order_intent_egg-12",
    status: "fulfillmentStarted",
    scenarioId: "home",
    category: "eggs",
    sellerAgentId: "farmhouse_hub",
    totalAmount: 20
  }
};

const explanationPayload: OrderExplanationPayload = {
  orderId: "order_intent_egg-12",
  explanation: [
    { type: "INTENT_CREATED" },
    { type: "QUOTE_SELECTED" },
    { type: "POLICY_EVALUATED" },
    { type: "ORDER_COMMITTED" }
  ],
  snapshot: successResult.snapshot
};

describe("explanation drawer and error states", () => {
  it("loads and renders the explanation drawer after a run", async () => {
    const client: DemoApiClient = {
      runReplenishment: vi.fn().mockResolvedValue(successResult),
      fetchOrderExplanation: vi.fn().mockResolvedValue(explanationPayload)
    };

    render(<App client={client} />);

    fireEvent.click(screen.getByRole("button", { name: "为这个家发起自动补货" }));
    await waitFor(() => {
      expect(screen.getByText("已为你的家庭提交一笔补货订单")).toBeTruthy();
    });

    fireEvent.click(screen.getByRole("button", { name: "查看订单解释" }));

    await waitFor(() => {
      expect(screen.getByText("为什么是这笔订单")).toBeTruthy();
    });

    const drawer = screen.getByRole("complementary");
    expect(drawer.textContent).toContain("INTENT_CREATED");
    expect(drawer.textContent).toContain("ORDER_COMMITTED");
    expect(drawer.textContent).toContain("scenarioId");
  });

  it("renders approval-required outcomes as a controlled pause", async () => {
    const client: DemoApiClient = {
      runReplenishment: vi.fn().mockResolvedValue({
        status: "approvalRequired",
        orderId: "order_intent_coffee-1kg",
        reason: "approval_required",
        explanation: ["INTENT_CREATED", "POLICY_EVALUATED", "APPROVAL_REQUIRED"],
        snapshot: {
          orderId: "order_intent_coffee-1kg",
          status: "approvalWait",
          scenarioId: "office",
          category: "coffee",
          sellerAgentId: "office_supply_prime",
          totalAmount: 54
        }
      }),
      fetchOrderExplanation: vi.fn()
    };

    render(<App client={client} />);

    fireEvent.click(screen.getByRole("tab", { name: "办公室 / 门店补货" }));
    fireEvent.click(screen.getByRole("button", { name: "为办公室发起自动补货" }));

    await waitFor(() => {
      expect(screen.getByText("这次补货需要你的确认")).toBeTruthy();
    });
  });

  it("shows backend startup guidance when the api is unavailable", async () => {
    const client: DemoApiClient = {
      runReplenishment: vi.fn().mockRejectedValue(new ApiUnavailableError()),
      fetchOrderExplanation: vi.fn()
    };

    render(<App client={client} />);

    fireEvent.click(screen.getByRole("button", { name: "为这个家发起自动补货" }));

    await waitFor(() => {
      expect(screen.getByText(/buyer API 未启动/)).toBeTruthy();
    });
  });
});
