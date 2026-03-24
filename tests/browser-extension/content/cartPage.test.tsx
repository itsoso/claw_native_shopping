// @vitest-environment jsdom

import { readFileSync } from "node:fs";

import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const eventMocks = vi.hoisted(() => ({
  recordEvent: vi.fn(),
}));

vi.mock("../../../apps/browser-extension/src/storage/events.js", () => ({
  recordEvent: eventMocks.recordEvent,
}));

import { CartPagePanel } from "../../../apps/browser-extension/src/content/cartPage.js";

describe("CartPagePanel", () => {
  beforeEach(() => {
    eventMocks.recordEvent.mockReset();
    eventMocks.recordEvent.mockResolvedValue(undefined);
    document.body.innerHTML = readFileSync(
      "tests/browser-extension/fixtures/jd/cart-page.html",
      "utf8",
    );
  });

  it("records cart plan events and actions", async () => {
    render(<CartPagePanel />);

    await waitFor(() => {
      expect(eventMocks.recordEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "cart_plan_shown",
          surface: "cart_page",
        }),
      );
    });

    expect(
      screen.queryByRole("button", { name: "查看原因" }),
    ).toBeNull();
    expect(
      screen.queryByRole("button", { name: "调整偏好" }),
    ).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "应用建议" }));

    await waitFor(() => {
      expect(eventMocks.recordEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "cart_plan_applied",
          surface: "cart_page",
        }),
      );
    });
  });
});
