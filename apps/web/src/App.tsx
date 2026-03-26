import { useState } from "react";

import { FlowTimeline } from "./components/FlowTimeline.js";
import { Hero } from "./components/Hero.js";
import { ExplanationPanel } from "./components/ExplanationPanel.js";
import { OpsDock } from "./components/OpsDock.js";
import { ScenarioPicker } from "./components/ScenarioPicker.js";
import { runDemoScenario } from "./runtime/demoRuntime.js";
import type { RunViewModel, ScenarioId, ScenarioMode } from "./runtime/types.js";
import { demoScenarios } from "./scenarios/index.js";

const DEFAULT_SCENARIO_ID = demoScenarios[0]?.id ?? "replenish-laundry";
const DEFAULT_MODE: ScenarioMode = "time_saving";

const runtimeState = {
  runtime: "demo" as const,
  health: {
    api: { status: "unknown" as const, message: "awaiting demo run" },
    seller: { status: "unknown" as const, message: "awaiting demo run" },
  },
};

export function App() {
  const [selectedScenarioId, setSelectedScenarioId] =
    useState<ScenarioId>(DEFAULT_SCENARIO_ID);
  const [selectedMode, setSelectedMode] = useState<ScenarioMode>(DEFAULT_MODE);
  const [runViewModel, setRunViewModel] = useState<RunViewModel | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const activeScenario =
    demoScenarios.find((scenario) => scenario.id === selectedScenarioId) ?? demoScenarios[0];

  const activeSummary = runViewModel?.summary ?? activeScenario?.summary ?? "";
  const activeTags = runViewModel?.explanationTags ?? activeScenario?.tags ?? [];
  const activeRuntime = runViewModel?.runtime ?? runtimeState.runtime;
  const activeHealth = runViewModel?.health ?? runtimeState.health;

  const handleSelectScenario = (scenarioId: ScenarioId): void => {
    setSelectedScenarioId(scenarioId);
    setRunViewModel(null);
  };

  const handleModeChange = (mode: ScenarioMode): void => {
    setSelectedMode(mode);
    setRunViewModel(null);
  };

  const handleRun = async (): Promise<void> => {
    setIsRunning(true);

    try {
      const result = await runDemoScenario(selectedScenarioId, selectedMode);
      setRunViewModel(result);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <main className="validation-console">
      <div className="validation-console__backdrop validation-console__backdrop--left" />
      <div className="validation-console__backdrop validation-console__backdrop--right" />

      <Hero
        activeRuntime={activeRuntime}
        activeScenario={activeScenario}
        isRunning={isRunning}
        mode={selectedMode}
        onRun={handleRun}
      />

      <section className="control-grid">
        <ScenarioPicker
          mode={selectedMode}
          onModeChange={handleModeChange}
          onSelectScenario={handleSelectScenario}
          selectedScenarioId={selectedScenarioId}
          scenarios={demoScenarios}
        />

        <OpsDock
          health={activeHealth}
          runtime={activeRuntime}
          onRuntimeSelect={() => undefined}
        />
      </section>

      {runViewModel ? (
        <section className="content-grid">
          <FlowTimeline steps={runViewModel.steps} />
          <ExplanationPanel
            mode={selectedMode}
            summary={activeSummary}
            tags={activeTags}
          />
        </section>
      ) : (
        <section className="empty-run panel">
          <p className="empty-run__eyebrow">Demo path</p>
          <h2>先选择一个场景，再点击开始演示。</h2>
          <p>
            当前页面会保持在展示和控制之间的平衡：上方讲清产品，下方在运行后显示可验证的决策链。
          </p>
        </section>
      )}
    </main>
  );
}
