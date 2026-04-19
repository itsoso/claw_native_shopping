import React from "react";
import type { RunViewModel } from "../runtime/types.js";

interface ExplanationPanelProps {
  run: RunViewModel | null;
}

export function ExplanationPanel({ run }: ExplanationPanelProps): React.ReactElement | null {
  if (!run) return null;
  return (
    <section className="explanation-panel">
      <h2>决策解释</h2>
      <p>{run.summary}</p>
      <ul className="tags">
        {run.explanationTags.map((tag) => (
          <li key={tag} className="tag">
            {tag}
          </li>
        ))}
      </ul>
    </section>
  );
}
