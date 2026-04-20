import { useState } from "react";
import type { CSSProperties } from "react";

import type { VerificationBadgeInfo, VerificationGrade } from "../types/verification.js";

type VerificationBadgeProps = {
  verification: VerificationBadgeInfo;
  onDetailsViewed?: (() => void) | undefined;
};

const gradeColors: Record<VerificationGrade, string> = {
  A: "#2d7a3a",
  B: "#8b6914",
  C: "#b36b1e",
  D: "#9c3a2e",
};

const gradeBackgrounds: Record<VerificationGrade, string> = {
  A: "rgba(45, 122, 58, 0.12)",
  B: "rgba(139, 105, 20, 0.12)",
  C: "rgba(179, 107, 30, 0.12)",
  D: "rgba(156, 58, 46, 0.12)",
};

const containerStyle: CSSProperties = {
  margin: "0 0 10px",
};

const badgeRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  cursor: "pointer",
};

const detailsStyle: CSSProperties = {
  marginTop: "8px",
  padding: "10px 12px",
  borderRadius: "10px",
  background: "rgba(255, 255, 255, 0.7)",
  border: "1px solid rgba(32, 24, 15, 0.08)",
  fontSize: "12px",
  lineHeight: 1.6,
  color: "#5c4a38",
};

const labelStyle: CSSProperties = {
  fontSize: "11px",
  color: "#8b7355",
  fontWeight: 600,
};

export function VerificationBadge({ verification, onDetailsViewed }: VerificationBadgeProps) {
  const [expanded, setExpanded] = useState(false);

  if (!verification.verified) {
    return null;
  }

  const pillStyle: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    padding: "3px 10px",
    borderRadius: "20px",
    background: gradeBackgrounds[verification.grade],
    color: gradeColors[verification.grade],
    fontSize: "12px",
    fontWeight: 700,
    lineHeight: 1,
  };

  const summaryStyle: CSSProperties = {
    fontSize: "12px",
    color: "#6b5a48",
    flex: 1,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  };

  const handleToggle = () => {
    if (!expanded && onDetailsViewed) {
      onDetailsViewed();
    }
    setExpanded((prev) => !prev);
  };

  return (
    <div style={containerStyle}>
      <div
        style={badgeRowStyle}
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        onClick={handleToggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") handleToggle();
        }}
      >
        <span style={pillStyle}>
          已验证 {verification.grade}
        </span>
        <span style={summaryStyle}>{verification.summary}</span>
        <span style={{ fontSize: "11px", color: "#a89480", whiteSpace: "nowrap" }}>
          {verification.verificationCount}次验证
        </span>
      </div>
      {expanded ? (
        <div style={detailsStyle}>
          <div><span style={labelStyle}>验证人：</span>{verification.verifierName}</div>
          <div><span style={labelStyle}>验证方式：</span>{verification.method}</div>
          <div><span style={labelStyle}>品质评价：</span>{verification.summary}</div>
        </div>
      ) : null}
    </div>
  );
}
