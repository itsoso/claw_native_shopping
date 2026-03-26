import { useRef, useState } from "react";

import { FlowTimeline } from "./components/FlowTimeline.js";
import { Hero } from "./components/Hero.js";
import { ExplanationPanel } from "./components/ExplanationPanel.js";
import { OpsDock } from "./components/OpsDock.js";
import { ScenarioPicker } from "./components/ScenarioPicker.js";
import { createLiveRuntime } from "./runtime/liveRuntime.js";
import { runDemoScenario } from "./runtime/demoRuntime.js";
import type {
  RunViewModel,
  ScenarioId,
  ScenarioMode,
  ServiceHealthViewModel,
  ValidationRuntime,
} from "./runtime/types.js";
import { demoScenarios } from "./scenarios/index.js";

const DEFAULT_SCENARIO_ID = demoScenarios[0]?.id ?? "replenish-laundry";
const DEFAULT_MODE: ScenarioMode = "time_saving";
const DEFAULT_RUNTIME: ValidationRuntime = "demo";
const LIVE_API_BASE_URL = "http://127.0.0.1:3000";
const LIVE_SELLER_BASE_URL = "http://127.0.0.1:3100";
type RuntimeHealthState = {
  api: ServiceHealthViewModel;
  seller: ServiceHealthViewModel;
};

const liveRuntime = createLiveRuntime({
  apiBaseUrl: LIVE_API_BASE_URL,
  sellerBaseUrl: LIVE_SELLER_BASE_URL,
});

const runtimeState = {
  runtime: DEFAULT_RUNTIME,
  health: {
    api: { status: "unknown" as const, message: "awaiting demo run" },
    seller: { status: "unknown" as const, message: "awaiting demo run" },
  },
};

const createFallbackHealth = (message: string): RuntimeHealthState => {
  const healthyService = { status: "ok" as const, message: "probe complete" };
  const failedService = { status: "error" as const, message };

  if (message.includes("seller-sim")) {
    return {
      api: healthyService,
      seller: failedService,
    };
  }

  if (message.includes("buyer-api")) {
    return {
      api: failedService,
      seller: healthyService,
    };
  }

  return {
    api: failedService,
    seller: failedService,
  };
};

export function App() {
  const runRequestIdRef = useRef(0);
  const currentIntentRef = useRef<{
    scenarioId: ScenarioId;
    mode: ScenarioMode;
    runtime: ValidationRuntime;
  }>({
    scenarioId: DEFAULT_SCENARIO_ID,
    mode: DEFAULT_MODE,
    runtime: runtimeState.runtime,
  });
  const [selectedScenarioId, setSelectedScenarioId] =
    useState<ScenarioId>(DEFAULT_SCENARIO_ID);
  const [selectedMode, setSelectedMode] = useState<ScenarioMode>(DEFAULT_MODE);
  const [selectedRuntime, setSelectedRuntime] = useState<ValidationRuntime>(
    DEFAULT_RUNTIME,
  );
  const [runViewModel, setRunViewModel] = useState<RunViewModel | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [runtimeHealthOverride, setRuntimeHealthOverride] =
    useState<RuntimeHealthState | null>(null);
  const [runtimeFailureMessage, setRuntimeFailureMessage] = useState<string | null>(null);

  const activeScenario =
    demoScenarios.find((scenario) => scenario.id === selectedScenarioId) ?? demoScenarios[0];

  const activeSummary = runViewModel?.summary ?? activeScenario?.summary ?? "";
  const activeTags = runViewModel?.explanationTags ?? activeScenario?.tags ?? [];
  const activeRuntime = runViewModel?.runtime ?? selectedRuntime;
  const activeHealth = runtimeHealthOverride ?? runViewModel?.health ?? runtimeState.health;

  const handleSelectScenario = (scenarioId: ScenarioId): void => {
    runRequestIdRef.current += 1;
    currentIntentRef.current = {
      ...currentIntentRef.current,
      scenarioId,
    };
    setSelectedScenarioId(scenarioId);
    setRunViewModel(null);
    setRuntimeHealthOverride(null);
    setRuntimeFailureMessage(null);
  };

  const handleModeChange = (mode: ScenarioMode): void => {
    runRequestIdRef.current += 1;
    currentIntentRef.current = {
      ...currentIntentRef.current,
      mode,
    };
    setSelectedMode(mode);
    setRunViewModel(null);
    setRuntimeHealthOverride(null);
    setRuntimeFailureMessage(null);
  };

  const handleRuntimeChange = (runtime: ValidationRuntime): void => {
    runRequestIdRef.current += 1;
    currentIntentRef.current = {
      ...currentIntentRef.current,
      runtime,
    };
    setSelectedRuntime(runtime);
    setRunViewModel(null);
    setRuntimeHealthOverride(null);
    setRuntimeFailureMessage(null);
  };

  const handleRun = async (): Promise<void> => {
    const requestId = ++runRequestIdRef.current;
    const requestSnapshot = { ...currentIntentRef.current };
    setIsRunning(true);
    setRuntimeFailureMessage(null);

    const intentIsCurrent = (): boolean =>
      runRequestIdRef.current === requestId &&
      currentIntentRef.current.scenarioId === requestSnapshot.scenarioId &&
      currentIntentRef.current.mode === requestSnapshot.mode &&
      currentIntentRef.current.runtime === requestSnapshot.runtime;

    setRuntimeHealthOverride(null);

    try {
      const result =
        requestSnapshot.runtime === "live"
          ? await liveRuntime.run(requestSnapshot.scenarioId, requestSnapshot.mode)
          : await runDemoScenario(requestSnapshot.scenarioId, requestSnapshot.mode);

      if (intentIsCurrent) {
        setRunViewModel(result);
      }
    } catch (error) {
      if (!intentIsCurrent()) {
        return;
      }

      const errorMessage =
        error instanceof Error ? error.message : "演示运行失败，请稍后重试。";

      if (requestSnapshot.runtime === "live") {
        setRunViewModel(null);
        setSelectedRuntime("demo");
        currentIntentRef.current = {
          ...currentIntentRef.current,
          runtime: "demo",
        };
        setRuntimeHealthOverride(createFallbackHealth(errorMessage));
        setRuntimeFailureMessage("服务不可用，已切回 Demo。");
      } else {
        setRuntimeFailureMessage(errorMessage);
      }
    } finally {
      if (runRequestIdRef.current === requestId) {
        setIsRunning(false);
      }
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
          onRuntimeSelect={handleRuntimeChange}
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
        <section className="empty-run panel" role="status" aria-live="polite">
          <p className="empty-run__eyebrow">
            {runtimeFailureMessage ? "Runtime fallback" : "Demo path"}
          </p>
          <h2>
            {runtimeFailureMessage ?? "先选择一个场景，再点击开始演示。"}
          </h2>
          <p>
            {runtimeFailureMessage
              ? "当前页面已回到 Demo 模式，你可以继续演示、切换场景，或稍后再尝试 Live。"
              : "当前页面会保持在展示和控制之间的平衡：上方讲清产品，下方在运行后显示可验证的决策链。"}
          </p>
        </section>
      )}
    </main>
  );
}
