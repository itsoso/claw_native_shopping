import React from "react";
import type { OrderExplanationPayload } from "../lib/types.js";

type ExplanationDrawerProps = {
  isOpen: boolean;
  isLoading: boolean;
  errorMessage: string | null;
  explanation: OrderExplanationPayload | null;
  onClose: () => void;
};

export const ExplanationDrawer = ({
  isOpen,
  isLoading,
  errorMessage,
  explanation,
  onClose
}: ExplanationDrawerProps): React.JSX.Element | null => {
  if (!isOpen) {
    return null;
  }

  return (
    <aside className="drawer" role="complementary">
      <div className="drawer-header">
        <div>
          <p className="section-kicker">Audit Trail</p>
          <h2>为什么是这笔订单</h2>
        </div>
        <button className="icon-button" onClick={onClose} type="button">
          收起
        </button>
      </div>
      {isLoading ? <p className="empty-copy">正在拉取解释链路...</p> : null}
      {errorMessage ? <p className="error-banner">{errorMessage}</p> : null}
      {explanation ? (
        <>
          <ol className="drawer-events">
            {explanation.explanation.map((event) => (
              <li key={event.type}>{event.type}</li>
            ))}
          </ol>
          <pre className="snapshot-block">
            {JSON.stringify(explanation.snapshot, null, 2)}
          </pre>
        </>
      ) : null}
    </aside>
  );
};
