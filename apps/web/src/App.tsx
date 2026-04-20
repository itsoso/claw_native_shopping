import React, { useMemo, useState } from "react";
import "./styles.css";

import { Hero } from "./components/Hero.js";
import { ScenarioPicker } from "./components/ScenarioPicker.js";
import { FlowTimeline } from "./components/FlowTimeline.js";
import { ExplanationPanel } from "./components/ExplanationPanel.js";
import { OpsDock } from "./components/OpsDock.js";
import { DemoPage } from "./demo/DemoPage.js";
import { demoScenarios } from "./scenarios/index.js";
import { runDemoScenario } from "./runtime/demoRuntime.js";
import { createLiveRuntime } from "./runtime/liveRuntime.js";
import type { RunViewModel, ValidationRuntime } from "./runtime/types.js";

type AppView = "console" | "demo";

const DEFAULT_API_BASE =
  (typeof import.meta !== "undefined" && (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_API_BASE_URL) ||
  "http://127.0.0.1:3000";
const DEFAULT_SELLER_BASE =
  (typeof import.meta !== "undefined" && (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_SELLER_BASE_URL) ||
  "http://127.0.0.1:3100";

export function App(): React.ReactElement {
  const [view, setView] = useState<AppView>("console");
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

  const liveRuntime = useMemo(
    () => createLiveRuntime({ apiBaseUrl: DEFAULT_API_BASE, sellerBaseUrl: DEFAULT_SELLER_BASE }),
    [],
  );

  async function handleStart(): Promise<void> {
    setLoading(true);
    setError(null);
    try {
      const result = runtime === "demo"
        ? await runDemoScenario(scenarioId, selectedScenario.preferredMode)
        : await liveRuntime.run(scenarioId, selectedScenario.preferredMode);
      setRun(result);
      const apiBad = result.health.api.status !== "ok";
      const sellerBad = result.health.seller.status !== "ok";
      if (result.runtime === "live" && (apiBad || sellerBad)) {
        setError(result.summary);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "unknown error");
    } finally {
      setLoading(false);
    }
  }

  function handleChangeRuntime(next: ValidationRuntime): void {
    setRuntime(next);
    setError(null);
    setRun(null);
  }

  return (
    <>
      <nav className="app-nav">
        <span className="app-nav-brand">OpenClaw</span>
        <div className="app-nav-tabs">
          <button
            type="button"
            className={`app-nav-tab${view === "console" ? " active" : ""}`}
            onClick={() => setView("console")}
          >
            验证控制台
          </button>
          <button
            type="button"
            className={`app-nav-tab${view === "demo" ? " active" : ""}`}
            onClick={() => setView("demo")}
          >
            商品体验 Demo
          </button>
        </div>
      </nav>
      {view === "demo" ? (
        <DemoPage />
      ) : (
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
            onChangeRuntime={handleChangeRuntime}
            run={run}
            error={error}
          />
        </main>
      )}
    </>
  );
}
