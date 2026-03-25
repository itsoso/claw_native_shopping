import React from "react";
import { runModeLabel } from "../lib/scenarios.js";
import type { DemoRunMode, ScenarioPresentation } from "../lib/types.js";

type HeroPanelProps = {
  scenario: ScenarioPresentation;
  runMode: DemoRunMode;
  onRunModeChange: (runMode: DemoRunMode) => void;
  onRun: () => void;
  onOpenExplanation: () => void;
  canOpenExplanation: boolean;
  isLoading: boolean;
};

export const HeroPanel = ({
  scenario,
  runMode,
  onRunModeChange,
  onRun,
  onOpenExplanation,
  canOpenExplanation,
  isLoading
}: HeroPanelProps): React.JSX.Element => {
  return (
    <section className="hero-card">
      <p className="eyebrow">{scenario.eyebrow}</p>
      <h1>{scenario.heading}</h1>
      <p className="hero-copy">{scenario.description}</p>
      <div className="hero-actions">
        <button className="primary-button" onClick={onRun} type="button">
          {isLoading ? "正在生成补货决策..." : scenario.ctaLabel}
        </button>
        <button
          className="secondary-button"
          disabled={!canOpenExplanation}
          onClick={onOpenExplanation}
          type="button"
        >
          查看订单解释
        </button>
      </div>
      <div aria-label="Demo path switcher" className="demo-mode-row" role="toolbar">
        {(["standard", "approval", "holdFailure"] as const).map((modeOption) => (
          <button
            key={modeOption}
            aria-pressed={runMode === modeOption}
            className="demo-mode-pill"
            onClick={() => {
              onRunModeChange(modeOption);
            }}
            type="button"
          >
            {runModeLabel[modeOption]}
          </button>
        ))}
      </div>
    </section>
  );
};
