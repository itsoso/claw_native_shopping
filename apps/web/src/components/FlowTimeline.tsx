import React from "react";
import type { ReplenishmentResult } from "../lib/types.js";

const eventLabelMap: Record<string, string> = {
  INTENT_CREATED: "需求已生成",
  QUOTE_SELECTED: "报价已锁定",
  POLICY_EVALUATED: "策略已评估",
  APPROVAL_REQUIRED: "等待确认",
  INVENTORY_HELD: "库存已锁定",
  PAYMENT_AUTHORIZED: "支付已授权",
  ORDER_COMMITTED: "订单已提交",
  INVENTORY_HOLD_FAILED: "库存锁定失败"
};

type FlowTimelineProps = {
  result: ReplenishmentResult | null;
};

export const FlowTimeline = ({ result }: FlowTimelineProps): React.JSX.Element => {
  return (
    <section className="surface-card">
      <div className="section-header">
        <p className="section-kicker">Flow</p>
        <h2>采购流程</h2>
      </div>
      {!result ? (
        <p className="empty-copy">
          点击自动补货，查看 OpenClaw 如何从缺货识别一路走到报价、策略判断和成交。
        </p>
      ) : (
        <ol className="timeline-list">
          {result.explanation.map((eventType) => (
            <li className="timeline-item" key={eventType}>
              <span className="timeline-bullet" />
              <div>
                <p className="timeline-title">{eventLabelMap[eventType] ?? eventType}</p>
                <p className="timeline-code">{eventType}</p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
};
