// @vitest-environment jsdom
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";

import { VerificationBadge } from "../../../apps/browser-extension/src/ui/VerificationBadge.js";
import type { VerificationBadgeInfo } from "../../../apps/browser-extension/src/types/verification.js";

const mockVerification: VerificationBadgeInfo = {
  verified: true,
  grade: "A",
  verifierName: "anchor_zhang",
  method: "直播品鉴",
  summary: "原味，微咸；色泽均匀",
  verificationCount: 3,
};

describe("VerificationBadge", () => {
  it("renders badge with grade and summary", () => {
    render(<VerificationBadge verification={mockVerification} />);
    expect(screen.getByText(/已验证 A/)).toBeTruthy();
    expect(screen.getByText("原味，微咸；色泽均匀")).toBeTruthy();
    expect(screen.getByText("3次验证")).toBeTruthy();
  });

  it("returns null when verified is false", () => {
    const unverified: VerificationBadgeInfo = {
      ...mockVerification,
      verified: false,
    };
    const { container } = render(<VerificationBadge verification={unverified} />);
    expect(container.innerHTML).toBe("");
  });

  it("calls onDetailsViewed when expanded", () => {
    const onDetailsViewed = vi.fn();
    render(
      <VerificationBadge
        verification={mockVerification}
        onDetailsViewed={onDetailsViewed}
      />
    );

    const badge = screen.getByRole("button");
    fireEvent.click(badge);

    expect(onDetailsViewed).toHaveBeenCalledOnce();
    expect(screen.getByText(/验证人：/)).toBeTruthy();
    expect(screen.getByText(/验证方式：/)).toBeTruthy();
  });

  it("does not call onDetailsViewed on collapse", () => {
    const onDetailsViewed = vi.fn();
    render(
      <VerificationBadge
        verification={mockVerification}
        onDetailsViewed={onDetailsViewed}
      />
    );

    const badge = screen.getByRole("button");
    fireEvent.click(badge);
    fireEvent.click(badge);

    expect(onDetailsViewed).toHaveBeenCalledOnce();
  });
});
