import React, { useState } from "react";
import "./styles.css";

import { Hero } from "./components/Hero.js";
import { ScenarioPicker } from "./components/ScenarioPicker.js";
import { FlowTimeline } from "./components/FlowTimeline.js";
import { ExplanationPanel } from "./components/ExplanationPanel.js";
import { OpsDock } from "./components/OpsDock.js";
import { demoScenarios } from "./scenarios/index.js";
import { runDemoScenario } from "./runtime/demoRuntime.js";
import type { RunViewModel, ValidationRuntime } from "./runtime/types.js";

export function App(): React.ReactElement {
  const [runtime, setRuntime] = useState<ValidationRuntime>("demo");
  const defaultScenario = demoScenarios[0];
  if (!defaultScenario) {
    throw new Error("demoScenarios must contain at least one entry");
  }
  const [scenarioId, setScenarioId] = useState<string>(defaultScenario.id);
  const [run, setRun] = useState<RunViewModel | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedScenario =
    demoScenarios.find((s) => s.id === scenarioId) ?? defaultScenario;

  async function handleStart(): Promise<void> {
    setLoading(true);
    setError(null);
    try {
      const result = await runDemoScenario(scenarioId, selectedScenario.preferredMode);
      setRun(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "unknown error");
      setRun(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <Hero onStart={handleStart} runtime={runtime} />
      <div className="columns">
        <ScenarioPicker
          scenarios={demoScenarios}
          selected={scenarioId}
          onSelect={setScenarioId}
        />
        <FlowTimeline steps={run?.steps ?? []} />
        <ExplanationPanel run={run} />
        {loading && <p className="loading">Running…</p>}
      </div>
      <OpsDock
        runtime={runtime}
        onChangeRuntime={setRuntime}
        run={run}
        error={error}
      />
    </main>
  );
}
