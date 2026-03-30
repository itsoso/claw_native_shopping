import type { ServiceHealthViewModel, ValidationRuntime } from "../runtime/types.js";

type OpsDockProps = {
  health: {
    api: ServiceHealthViewModel;
    seller: ServiceHealthViewModel;
  };
  onRuntimeSelect: (runtime: ValidationRuntime) => void;
  runtime: ValidationRuntime;
};

const healthLabel: Record<ServiceHealthViewModel["status"], string> = {
  unknown: "未检查",
  ok: "健康",
  error: "异常",
};

export function OpsDock({ health, onRuntimeSelect, runtime }: OpsDockProps) {
  return (
    <aside className="panel ops-dock">
      <div className="panel__header">
        <div>
          <p className="eyebrow">运行状态</p>
          <h2>查看当前模式和本地服务健康状态。</h2>
        </div>
      </div>

      <div className="runtime-toggle" role="group" aria-label="runtime toggle">
        <button
          className="mode-chip mode-chip--runtime"
          data-active={runtime === "demo"}
          aria-pressed={runtime === "demo"}
          type="button"
          onClick={() => onRuntimeSelect("demo")}
        >
          演示模式
        </button>
        <button
          className="mode-chip mode-chip--runtime"
          data-active={runtime === "live"}
          aria-pressed={runtime === "live"}
          type="button"
          onClick={() => onRuntimeSelect("live")}
        >
          联调模式
        </button>
      </div>

      <div className="runtime-summary">
        <span className="runtime-summary__label">当前路径</span>
        <strong>{runtime === "demo" ? "演示模式" : "联调模式"}</strong>
      </div>

      <div className="health-grid">
        <article className="health-card">
          <span className="health-card__label">Buyer API</span>
          <strong>{healthLabel[health.api.status]}</strong>
          {health.api.message ? <p>{health.api.message}</p> : null}
        </article>
        <article className="health-card">
          <span className="health-card__label">Seller Sim</span>
          <strong>{healthLabel[health.seller.status]}</strong>
          {health.seller.message ? <p>{health.seller.message}</p> : null}
        </article>
      </div>
    </aside>
  );
}
