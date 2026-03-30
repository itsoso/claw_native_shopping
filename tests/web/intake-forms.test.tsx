// @vitest-environment jsdom

import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { App } from "../../apps/web/src/App.js";

describe("release intake forms", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("submits feedback and interest after a demo run completes", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue({ ok: true, json: async () => ({ accepted: true }) } as Response);

    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "开始演示" }));

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /留下反馈/i })).toBeTruthy();
    });

    fireEvent.change(screen.getByLabelText("这次演示最有说服力的部分"), {
      target: { value: "解释链路很清楚" },
    });
    fireEvent.click(screen.getByRole("button", { name: "提交反馈" }));

    fireEvent.change(screen.getByLabelText("邮箱"), {
      target: { value: "tester@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "加入候补" }));

    await waitFor(() => {
      expect(screen.getByText("反馈已记录")).toBeTruthy();
      expect(screen.getByText("已加入候补名单")).toBeTruthy();
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/live/intake/feedback",
      expect.objectContaining({ method: "POST" }),
    );
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/live/intake/interest",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("shows server-side failures without pretending the input is invalid", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockRejectedValue(new Error("network down"));

    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "开始演示" }));

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /留下反馈/i })).toBeTruthy();
    });

    fireEvent.change(screen.getByLabelText("这次演示最有说服力的部分"), {
      target: { value: "解释链路很清楚" },
    });
    fireEvent.click(screen.getByRole("button", { name: "提交反馈" }));

    fireEvent.change(screen.getByLabelText("邮箱"), {
      target: { value: "tester@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "加入候补" }));

    await waitFor(() => {
      expect(screen.getByText("反馈提交失败，请稍后再试")).toBeTruthy();
      expect(screen.getByText("候补提交失败，请稍后再试")).toBeTruthy();
    });

    expect(fetchMock).toHaveBeenCalled();
  });
});
