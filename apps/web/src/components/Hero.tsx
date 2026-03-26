import type { ScenarioDefinition, ValidationRuntime, ScenarioMode } from "../runtime/types.js";

type HeroProps = {
  activeScenario: ScenarioDefinition | undefined;
  activeRuntime: ValidationRuntime;
  isRunning: boolean;
  mode: ScenarioMode;
  onRun: () => Promise<void>;
};

const modeLabel: Record<ScenarioMode, string> = {
  time_saving: "更省时间",
  safe: "更稳妥",
  value: "更划算",
};

export function Hero({ activeScenario, activeRuntime, isRunning, mode, onRun }: HeroProps) {
  return (
    <section className="hero panel hero-panel">
      <div className="hero__copy">
        <p className="eyebrow">Showroom + Control Room</p>
        <h1>OpenClaw 不是帮人逛电商，而是替人完成消费决策。</h1>
        <h2 className="sr-only">OpenClaw does not help users browse.</h2>
        <p className="hero__lede">
          面向投资人和合作方的验证页，先给出清晰的产品叙事，再在同一屏里跑通可操作的 demo
          path。
        </p>

        <div className="hero__actions">
          <button className="primary-button" type="button" onClick={() => void onRun()} disabled={isRunning}>
            {isRunning ? "演示运行中" : "开始演示"}
          </button>

          <div className="hero__runtime-stack" aria-label="current runtime and mode">
            <span className="runtime-pill runtime-pill--warm">
              {activeRuntime === "demo" ? "Demo path" : "Live path"}
            </span>
            <span className="runtime-pill">{modeLabel[mode]}</span>
          </div>
        </div>
      </div>

      <aside className="hero__panel">
        <div className="hero__panel-label">当前场景</div>
        <h2>{activeScenario?.title ?? "未选择场景"}</h2>
        <p>{activeScenario?.summary ?? "选择一个演示场景后，点击开始演示即可生成完整链路。"}</p>
        <ul className="tag-list">
          {activeScenario?.tags.map((tag) => (
            <li className="tag" key={tag}>
              {tag}
            </li>
          ))}
        </ul>
      </aside>
    </section>
  );
}
