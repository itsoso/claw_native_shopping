import { useEffect, useState } from "react";

import type { IntakeSummary } from "../runtime/intakeClient.js";

type IntakeSummaryPanelProps = {
  loadSummary: () => Promise<IntakeSummary>;
  refreshKey: number;
};

const defaultSummary: IntakeSummary = {
  feedbackCount: 0,
  interestCount: 0,
  recentFeedback: [],
};

export function IntakeSummaryPanel({
  loadSummary,
  refreshKey,
}: IntakeSummaryPanelProps) {
  const [summary, setSummary] = useState<IntakeSummary>(defaultSummary);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");

    void loadSummary()
      .then((nextSummary) => {
        if (cancelled) {
          return;
        }

        setSummary(nextSummary);
        setStatus("ready");
      })
      .catch(() => {
        if (cancelled) {
          return;
        }

        setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [loadSummary, refreshKey]);

  return (
    <section className="panel intake-panel intake-summary-panel">
      <div className="panel__header">
        <div>
          <p className="eyebrow">User Signal</p>
          <h2>最近的反馈信号</h2>
        </div>
        <div className="tag-list">
          <span className="tag tag--soft">{summary.feedbackCount} 条反馈</span>
          <span className="tag tag--soft">{summary.interestCount} 人候补</span>
        </div>
      </div>

      {status === "error" ? (
        <p className="panel__hint">暂时还拉不到最近反馈，但提交表单仍然可用。</p>
      ) : summary.recentFeedback.length > 0 ? (
        <div className="context-panel__list">
          {summary.recentFeedback.map((entry) => (
            <article
              className="context-card"
              key={`${entry.recordedAt}-${entry.scenarioId}-${entry.message}`}
            >
              <span className="context-card__label">{entry.scenarioId}</span>
              <strong>{entry.message}</strong>
            </article>
          ))}
        </div>
      ) : (
        <p className="panel__hint">
          {status === "loading"
            ? "正在加载最近的反馈摘要。"
            : "现在还没有用户反馈，你的这条会成为第一条信号。"}
        </p>
      )}
    </section>
  );
}
