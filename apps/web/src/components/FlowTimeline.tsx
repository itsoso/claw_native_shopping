import type { RunStepViewModel } from "../runtime/types.js";

type FlowTimelineProps = {
  steps: readonly RunStepViewModel[];
};

const statusCopy: Record<RunStepViewModel["status"], string> = {
  pending: "待执行",
  running: "进行中",
  complete: "已完成",
  error: "异常",
};

export function FlowTimeline({ steps }: FlowTimelineProps) {
  return (
    <section className="panel flow-timeline">
      <div className="panel__header">
        <div>
          <p className="eyebrow">决策时间线</p>
          <h2>把一次补货任务拆成可验证、可解释的机器决策。</h2>
        </div>
        <p className="panel__hint">每一步都保留解释，方便你回看代理为什么这么做。</p>
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
