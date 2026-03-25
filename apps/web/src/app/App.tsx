import React, { useEffect, useState } from "react";
import { ExplanationDrawer } from "../components/ExplanationDrawer.js";
import { FlowTimeline } from "../components/FlowTimeline.js";
import { HeroPanel } from "../components/HeroPanel.js";
import { InventoryPressurePanel } from "../components/InventoryPressurePanel.js";
import { OrderSummaryCard } from "../components/OrderSummaryCard.js";
import { ScenarioTabs } from "../components/ScenarioTabs.js";
import { ApiUnavailableError, createDemoApiClient } from "../lib/api.js";
import { scenarioById } from "../lib/scenarios.js";
import type {
  DemoApiClient,
  DemoRunMode,
  OrderExplanationPayload,
  ReplenishmentResult,
  ScenarioId
} from "../lib/types.js";

const browserClient = createDemoApiClient();

const clearDrawerState = () => ({
  isOpen: false,
  isLoading: false,
  errorMessage: null as string | null,
  explanation: null as OrderExplanationPayload | null
});

const getResultOrderId = (result: ReplenishmentResult | null): string | null => {
  if (!result) {
    return null;
  }

  return result.orderId ?? result.snapshot.orderId ?? null;
};

type AppProps = {
  client?: DemoApiClient;
};

export const App = ({ client = browserClient }: AppProps): React.JSX.Element => {
  const [scenarioId, setScenarioId] = useState<ScenarioId>("home");
  const [runMode, setRunMode] = useState<DemoRunMode>("standard");
  const [result, setResult] = useState<ReplenishmentResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [drawerState, setDrawerState] = useState(clearDrawerState);

  const scenario = scenarioById[scenarioId];
  const orderId = getResultOrderId(result);

  useEffect(() => {
    setResult(null);
    setErrorMessage(null);
    setRunMode("standard");
    setDrawerState(clearDrawerState());
  }, [scenarioId]);

  const handleRun = async (): Promise<void> => {
    setIsRunning(true);
    setErrorMessage(null);
    setDrawerState(clearDrawerState());

    try {
      const nextResult = await client.runReplenishment({
        scenarioId,
        runMode
      });
      setResult(nextResult);
    } catch (error) {
      setResult(null);
      setErrorMessage(
        error instanceof ApiUnavailableError
          ? "buyer API 未启动。请先运行 pnpm start:api。"
          : "补货执行失败，请稍后重试。"
      );
    } finally {
      setIsRunning(false);
    }
  };

  const handleOpenExplanation = async (): Promise<void> => {
    if (!orderId) {
      return;
    }

    setDrawerState((currentState) => ({
      ...currentState,
      isOpen: true,
      isLoading: currentState.explanation?.orderId === orderId ? false : true,
      errorMessage: null
    }));

    if (drawerState.explanation?.orderId === orderId) {
      return;
    }

    try {
      const explanation = await client.fetchOrderExplanation(orderId);
      setDrawerState({
        isOpen: true,
        isLoading: false,
        errorMessage: null,
        explanation
      });
    } catch (error) {
      setDrawerState({
        isOpen: true,
        isLoading: false,
        errorMessage:
          error instanceof ApiUnavailableError
            ? "解释链路暂时不可用，请确认 buyer API 已启动。"
            : "暂时无法拉取订单解释。",
        explanation: null
      });
    }
  };

  return (
    <main className="app-shell">
      <HeroPanel
        canOpenExplanation={orderId !== null}
        isLoading={isRunning}
        onOpenExplanation={() => {
          void handleOpenExplanation();
        }}
        onRun={() => {
          void handleRun();
        }}
        onRunModeChange={setRunMode}
        runMode={runMode}
        scenario={scenario}
      />
      <ScenarioTabs
        onSelectScenario={setScenarioId}
        selectedScenario={scenarioId}
      />
      {errorMessage ? <p className="error-banner">{errorMessage}</p> : null}
      <section className="dashboard-grid">
        <InventoryPressurePanel scenario={scenario} />
        <FlowTimeline result={result} />
        <OrderSummaryCard
          result={result}
          runMode={runMode}
          scenarioId={scenarioId}
        />
      </section>
      <ExplanationDrawer
        errorMessage={drawerState.errorMessage}
        explanation={drawerState.explanation}
        isLoading={drawerState.isLoading}
        isOpen={drawerState.isOpen}
        onClose={() => {
          setDrawerState((currentState) => ({
            ...currentState,
            isOpen: false
          }));
        }}
      />
    </main>
  );
};
