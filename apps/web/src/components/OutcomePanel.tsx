import type { ScenarioMode, ScenarioOutcomeDefinition } from "../runtime/types.js";

type OutcomePanelProps = {
  mode: ScenarioMode;
  outcome: ScenarioOutcomeDefinition;
};

const modeCopy: Record<ScenarioMode, string> = {
  time_saving: "更省时间",
  safe: "更稳妥",
  value: "更划算",
};

export function OutcomePanel({ mode, outcome }: OutcomePanelProps) {
  return (
    <section className="panel outcome-panel">
      <div className="panel__header">
        <div>
          <p className="eyebrow">代理建议</p>
          <h2>本次代理会这样买</h2>
        </div>
        <span className="mode-badge">{modeCopy[mode]}</span>
      </div>

      <div className="outcome-panel__hero">
        <strong>{outcome.itemLabel}</strong>
        <span className="tag tag--accent">{outcome.decisionLabel}</span>
      </div>

      <p className="explanation-panel__summary">{outcome.detail}</p>
      <div className="outcome-panel__facts">
        <article className="context-card">
          <span className="context-card__label">选择卖家</span>
          <strong>{outcome.sellerLabel}</strong>
        </article>
        <article className="context-card">
          <span className="context-card__label">预计总价</span>
          <strong>{outcome.priceLabel}</strong>
        </article>
        <article className="context-card">
          <span className="context-card__label">履约承诺</span>
          <strong>{outcome.etaLabel}</strong>
        </article>
        <article className="context-card">
          <span className="context-card__label">比选结果</span>
          <strong>{outcome.comparisonLabel}</strong>
        </article>
      </div>
      {outcome.note ? <p className="outcome-panel__note">{outcome.note}</p> : null}
    </section>
  );
}
