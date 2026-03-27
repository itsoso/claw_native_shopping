import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

describe("architecture docs", () => {
  it("keeps the architecture entrypoint and roadshow docs wired from the README", () => {
    const readme = readFileSync("README.md", "utf8");
    const architecture = readFileSync("ARCHITECTURE.md", "utf8");
    const currentArchitecture = readFileSync(
      "docs/2026-03-26-claw-native-commerce-current-architecture.zh-CN.md",
      "utf8",
    );
    const investorBrief = readFileSync(
      "docs/2026-03-26-claw-native-commerce-investor-brief.zh-CN.md",
      "utf8",
    );
    const systemBreakdown = readFileSync(
      "docs/2026-03-26-claw-native-commerce-system-breakdown.zh-CN.md",
      "utf8",
    );
    const roadshow = readFileSync(
      "docs/2026-03-27-claw-native-commerce-roadshow-narrative.zh-CN.md",
      "utf8",
    );

    expect(readme).toContain("Architecture Docs");
    expect(readme).toContain("./ARCHITECTURE.md");
    expect(readme).toContain("2026-03-27-claw-native-commerce-roadshow-narrative.zh-CN.md");

    expect(architecture).toContain("Canonical Current-State Architecture");
    expect(architecture).toContain("Investor / Partner Brief");
    expect(architecture).toContain("Team System Breakdown");
    expect(architecture).toContain("Roadshow Narrative");
    expect(architecture).toContain("working baseline for an agent commerce stack");

    expect(currentArchitecture).toContain("买方代理优先的消费决策与采购执行系统");
    expect(investorBrief).toContain("buyer API + orchestrator + seller protocol");
    expect(systemBreakdown).toContain("orchestrator");
    expect(systemBreakdown).toContain("seller protocol");
    expect(roadshow).toContain("30 秒版本");
    expect(roadshow).toContain("3 分钟版本");
    expect(roadshow).toContain("10 分钟版本");
    expect(roadshow).toContain("主代理时代的消费交易底座");
  });
});
