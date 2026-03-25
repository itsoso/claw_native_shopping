import React, { useState } from "react";

type ScenarioId = "home" | "office";

const scenarioContent: Record<
  ScenarioId,
  {
    heading: string;
    eyebrow: string;
    description: string;
  }
> = {
  home: {
    heading: "你的冰箱正在等待下一次自动补货",
    eyebrow: "Household Autopilot",
    description:
      "OpenClaw 先看见鸡蛋、牛奶和纸巾的缺口，再决定是否替你发起一次补货。"
  },
  office: {
    heading: "让门店和办公室的高频耗材自动归位",
    eyebrow: "Ops Replenishment",
    description:
      "把咖啡豆、瓶装水和清洁用品的补货交给代理，只在超预算或异常时叫你。"
  }
};

export const App = (): React.JSX.Element => {
  const [scenario, setScenario] = useState<ScenarioId>("home");
  const current = scenarioContent[scenario];

  return (
    <main className="app-shell">
      <section className="hero-card">
        <p className="eyebrow">{current.eyebrow}</p>
        <h1>{current.heading}</h1>
        <p className="hero-copy">{current.description}</p>
        <div aria-label="Scenario switcher" className="scenario-tabs" role="tablist">
          <button
            aria-selected={scenario === "home"}
            className="scenario-tab"
            onClick={() => {
              setScenario("home");
            }}
            role="tab"
            type="button"
          >
            家庭冰箱补货
          </button>
          <button
            aria-selected={scenario === "office"}
            className="scenario-tab"
            onClick={() => {
              setScenario("office");
            }}
            role="tab"
            type="button"
          >
            办公室 / 门店补货
          </button>
        </div>
      </section>
    </main>
  );
};
