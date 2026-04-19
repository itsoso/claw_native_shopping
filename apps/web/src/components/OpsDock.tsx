import React from "react";
import type { RunViewModel, ValidationRuntime } from "../runtime/types.js";

interface OpsDockProps {
  runtime: ValidationRuntime;
  onChangeRuntime: (runtime: ValidationRuntime) => void;
  run: RunViewModel | null;
  error: string | null;
}

export function OpsDock({
  runtime,
  onChangeRuntime,
  run,
  error,
}: OpsDockProps): React.ReactElement {
  const health = run?.health;
  return (
    <aside className="ops-dock">
      <h2>Ops</h2>

      <div className="runtime-toggle" role="group" aria-label="runtime">
        <button
          type="button"
          aria-pressed={runtime === "demo"}
          className={runtime === "demo" ? "selected" : ""}
          onClick={() => onChangeRuntime("demo")}
        >
          Demo
        </button>
        <button
          type="button"
          aria-pressed={runtime === "live"}
          className={runtime === "live" ? "selected" : ""}
          onClick={() => onChangeRuntime("live")}
        >
          Live
        </button>
      </div>

      <dl className="health-grid">
        <dt>Buyer API</dt>
        <dd>
          <span
            className={`badge ${health?.api.status === "ok" ? "ok" : "bad"}`}
          >
            {health?.api.status ?? "unknown"}
          </span>
        </dd>
        <dt>Seller Sim</dt>
        <dd>
          <span
            className={`badge ${health?.seller.status === "ok" ? "ok" : "bad"}`}
          >
            {health?.seller.status ?? "unknown"}
          </span>
        </dd>
      </dl>

      {error && (
        <div className="error" role="alert">
          <strong>服务不可用</strong>
          <div>{error}</div>
        </div>
      )}
    </aside>
  );
}
