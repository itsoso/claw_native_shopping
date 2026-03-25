import React from "react";
import { runModeLabel, scenarioById } from "../lib/scenarios.js";
import type { DemoRunMode, ReplenishmentResult, ScenarioId } from "../lib/types.js";

type OrderSummaryCardProps = {
  result: ReplenishmentResult | null;
  scenarioId: ScenarioId;
  runMode: DemoRunMode;
};

const formatCurrency = (amount?: number): string =>
  amount === undefined ? "—" : `¥${amount}`;

const buildHeadline = (result: ReplenishmentResult | null, scenarioId: ScenarioId): string => {
  if (!result) {
    return scenarioId === "home"
      ? "让代理替你走完一次家庭补货"
      : "先看库存，再决定是否自动为办公室补货";
  }

  if (result.status === "orderCommitted") {
    return scenarioId === "home"
      ? "已为你的家庭提交一笔补货订单"
      : "已为你的办公室锁定并提交补货订单";
  }

  if (result.status === "approvalRequired") {
    return "这次补货需要你的确认";
  }

  return result.reason === "inventory_hold_failed"
    ? "库存锁定失败，OpenClaw 建议稍后重试"
    : "这次补货需要重新选择路径";
};

export const OrderSummaryCard = ({
  result,
  scenarioId,
  runMode
}: OrderSummaryCardProps): React.JSX.Element => {
  const scenario = scenarioById[scenarioId];

  return (
    <section className="surface-card summary-card">
      <div className="section-header">
        <p className="section-kicker">Outcome</p>
        <h2>{buildHeadline(result, scenarioId)}</h2>
      </div>
      {!result ? (
        <p className="empty-copy">
          当前场景：{scenario.tabLabel}。你可以先用 {runModeLabel[runMode]} 查看这条路径如何被前端演示。
        </p>
      ) : (
        <dl className="summary-grid">
          <div>
            <dt>状态</dt>
            <dd>{result.snapshot.status}</dd>
          </div>
          <div>
            <dt>卖方代理</dt>
            <dd>{result.snapshot.sellerAgentId ?? "待定"}</dd>
          </div>
          <div>
            <dt>总金额</dt>
            <dd>{formatCurrency(result.snapshot.totalAmount)}</dd>
          </div>
          <div>
            <dt>品类</dt>
            <dd>{result.snapshot.category}</dd>
          </div>
        </dl>
      )}
    </section>
  );
};
