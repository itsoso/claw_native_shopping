import React from "react";
import type { RunStepViewModel } from "../runtime/types.js";

interface FlowTimelineProps {
  steps: RunStepViewModel[];
}

export function FlowTimeline({ steps }: FlowTimelineProps): React.ReactElement | null {
  if (steps.length === 0) return null;
  return (
    <section className="flow-timeline">
      <h2>Flow</h2>
      <ol>
        {steps.map((step) => (
          <li key={step.id}>
            <div className="step-title">{step.title}</div>
            <div className="step-body">{step.body}</div>
          </li>
        ))}
      </ol>
    </section>
  );
}
