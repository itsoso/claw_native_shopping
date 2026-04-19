import React, { useMemo, useState } from "react";
import "./styles.css";

import { Hero } from "./components/Hero.js";
import { ScenarioPicker } from "./components/ScenarioPicker.js";
import { FlowTimeline } from "./components/FlowTimeline.js";
import { ExplanationPanel } from "./components/ExplanationPanel.js";
import { OpsDock } from "./components/OpsDock.js";
import { demoScenarios } from "./scenarios/index.js";
import { runDemoScenario } from "./runtime/demoRuntime.js";
import { createLiveRuntime } from "./runtime/liveRuntime.js";
import type { RunViewModel, ValidationRuntime } from "./runtime/types.js";

const DEFAULT_API_BASE =
  (typeof import.meta !== "undefined" && (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_API_BASE_URL) ||
  "http://127.0.0.1:3000";
const DEFAULT_SELLER_BASE =
  (typeof import.meta !== "undefined" && (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_SELLER_BASE_URL) ||
  "http://127.0.0.1:3100";

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
      // Live 模式下, 任一服务不可用 → 暴露为顶层 error, Ops Dock 展示 "服务不可用" 区块.
      const apiBad = result.health.api.status !== "ok";
      const sellerBad = result.health.seller.status !== "ok";
      if (result.runtime === "live" && (apiBad || sellerBad)) {
        setError(result.summary);
      }
    } catch (e) {
      // 即使 Live 崩溃, Demo 仍然可用 — 不清空现有 run.
      setError(e instanceof Error ? e.message : "unknown error");
    } finally {
      setLoading(false);
    }
  }

  function handleChangeRuntime(next: ValidationRuntime): void {
    setRuntime(next);
    // 切换运行时, 清空错误与旧结果以避免混淆.
    setError(null);
    setRun(null);
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
        onChangeRuntime={handleChangeRuntime}
        run={run}
        error={error}
      />
    </main>
  );
}
