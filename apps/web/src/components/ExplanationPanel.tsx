import type { ScenarioMode } from "../runtime/types.js";

type ExplanationPanelProps = {
  mode: ScenarioMode;
  summary: string;
  tags: readonly string[];
};

const modeCopy: Record<ScenarioMode, string> = {
  time_saving: "更省时间",
  safe: "更稳妥",
  value: "更划算",
};

export function ExplanationPanel({ mode, summary, tags }: ExplanationPanelProps) {
  return (
    <section className="panel explanation-panel">
      <div className="panel__header">
        <div>
          <p className="eyebrow">Explanation Panel</p>
          <h2>解释为什么这是当前模式下的默认解。</h2>
        </div>
        <span className="mode-badge">{modeCopy[mode]}</span>
      </div>

      <p className="explanation-panel__summary">{summary}</p>

      <div className="explanation-panel__tags">
        {tags.map((tag) => (
          <span className="tag tag--accent" key={tag}>
            {tag}
          </span>
        ))}
      </div>
    </section>
  );
}
