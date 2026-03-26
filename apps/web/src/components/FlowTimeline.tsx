import type { RunStepViewModel } from "../runtime/types.js";

type FlowTimelineProps = {
  steps: readonly RunStepViewModel[];
};

const statusCopy: Record<RunStepViewModel["status"], string> = {
  pending: "Pending",
  running: "Running",
  complete: "Complete",
  error: "Error",
};

export function FlowTimeline({ steps }: FlowTimelineProps) {
  return (
    <section className="panel flow-timeline">
      <div className="panel__header">
        <div>
          <p className="eyebrow">Flow Timeline</p>
          <h2>把购物任务拆成可验证的机器决策。</h2>
        </div>
        <p className="panel__hint">每一步都保留解释，便于演示和回看。</p>
      </div>

      <ol className="timeline">
        {steps.map((step, index) => (
          <li className="timeline__step" key={step.id}>
            <div className="timeline__marker">
              <span>{String(index + 1).padStart(2, "0")}</span>
            </div>

            <div className="timeline__content">
              <div className="timeline__topline">
                <h3>{step.title}</h3>
                <span className={`step-status step-status--${step.status}`}>{statusCopy[step.status]}</span>
              </div>
              <p>{step.detail}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
