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
        <p className="eyebrow">家庭补货发布版</p>
        <h1>OpenClaw 不是帮你搜商品，而是替你完成补货决策。</h1>
        <h2 className="sr-only">OpenClaw 会替用户完成补货决策，而不是只做搜索和推荐。</h2>
        <p className="hero__lede">
          这是一个面向潜在用户的可运行演示：先识别库存需求，再比较方案、执行策略判断，并把为什么这么买解释清楚。
        </p>

        <div className="hero__actions">
          <button className="primary-button" type="button" onClick={() => void onRun()} disabled={isRunning}>
            {isRunning ? "演示运行中" : "开始演示"}
          </button>

          <div className="hero__runtime-stack" aria-label="current runtime and mode">
            <span className="runtime-pill runtime-pill--warm">
              {activeRuntime === "demo" ? "演示路径" : "联调路径"}
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
