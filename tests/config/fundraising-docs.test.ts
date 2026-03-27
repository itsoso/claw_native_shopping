import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

describe("fundraising docs", () => {
  it("keeps the fundraising narrative docs present and structured", () => {
    const bpSkeleton = readFileSync(
      "docs/2026-03-27-claw-native-commerce-fundraising-bp-skeleton.zh-CN.md",
      "utf8",
    );
    const deckOutline = readFileSync(
      "docs/2026-03-27-claw-native-commerce-deck-outline.zh-CN.md",
      "utf8",
    );
    const deckCopy = readFileSync(
      "docs/2026-03-27-claw-native-commerce-deck-copy.zh-CN.md",
      "utf8",
    );

    expect(bpSkeleton).toContain("融资 BP 文案骨架");
    expect(bpSkeleton).toContain("问题");
    expect(bpSkeleton).toContain("机会判断");
    expect(bpSkeleton).toContain("解决方案");
    expect(bpSkeleton).toContain("商业模式");
    expect(bpSkeleton).toContain("融资用途");
    expect(bpSkeleton).toContain("用户主代理时代的消费交易底座");

    expect(deckOutline).toContain("10 页以内路演 Deck 大纲");
    expect(deckOutline).toContain("Slide 1: Cover");
    expect(deckOutline).toContain("Slide 5: Product Today");
    expect(deckOutline).toContain("Slide 10: Ask / Vision");
    expect(deckOutline).toContain("每页一句讲稿");
    expect(deckOutline).toContain("交易底座");

    expect(deckCopy).toContain("路演 Deck 逐页文案");
    expect(deckCopy).toContain("Slide 1");
    expect(deckCopy).toContain("Slide 10");
    expect(deckCopy).toContain("页面标题");
    expect(deckCopy).toContain("视觉建议");
    expect(deckCopy).toContain("口播要点");
    expect(deckCopy).toContain("常见讲偏的坑");
  });
});
