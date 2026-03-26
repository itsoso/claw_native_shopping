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
  unknown: "Unknown",
  ok: "Healthy",
  error: "Error",
};

export function OpsDock({ health, onRuntimeSelect, runtime }: OpsDockProps) {
  return (
    <aside className="panel ops-dock">
      <div className="panel__header">
        <div>
          <p className="eyebrow">Ops Dock</p>
          <h2>运行状态与服务健康。</h2>
        </div>
      </div>

      <div className="runtime-toggle" role="group" aria-label="runtime toggle">
        <button
          className="mode-chip mode-chip--runtime"
          data-active={runtime === "demo"}
          type="button"
          onClick={() => onRuntimeSelect("demo")}
        >
          Demo mode
        </button>
        <button
          className="mode-chip mode-chip--runtime"
          disabled
          data-active={runtime === "live"}
          type="button"
          title="Live runtime will be wired in Task 7"
          onClick={() => onRuntimeSelect("live")}
        >
          Live
        </button>
      </div>

      <div className="runtime-summary">
        <span className="runtime-summary__label">Runtime State</span>
        <strong>{runtime === "demo" ? "Demo" : "Live"}</strong>
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
