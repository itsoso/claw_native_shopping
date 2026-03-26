// @vitest-environment jsdom

import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { App } from "../../apps/web/src/App.js";

describe("validation console", () => {
  it("runs the default scenario and shows timeline steps and ops state", async () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "开始演示" }));

    await waitFor(() => {
      expect(screen.getByText("Demand")).toBeTruthy();
      expect(screen.getByText("Decision")).toBeTruthy();
      expect(screen.getByText("Demo")).toBeTruthy();
    });
  });
});
