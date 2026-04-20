import type { CSSProperties } from "react";

import type { DecisionMode } from "../types/preferences.js";
import type { VerificationBadgeInfo } from "../types/verification.js";
import { PreferenceMode } from "./PreferenceMode.js";
import { VerificationBadge } from "./VerificationBadge.js";

export type DecisionCardAction = {
  label: string;
  onClick?: () => void;
};

export type DecisionCardProps = {
  primaryAction: string;
  reason: string;
  mode?: DecisionMode;
  onModeChange?: (mode: DecisionMode) => void;
  footerActions?: DecisionCardAction[];
  verification?: VerificationBadgeInfo | undefined;
  onVerificationDetailsViewed?: (() => void) | undefined;
};

const cardStyle: CSSProperties = {
  position: "relative",
  width: "min(360px, calc(100vw - 32px))",
  padding: "18px",
  borderRadius: "22px",
  border: "1px solid rgba(32, 24, 15, 0.12)",
  background:
    "linear-gradient(180deg, rgba(255, 248, 235, 0.98) 0%, rgba(255, 255, 251, 0.98) 100%)",
  boxShadow:
    "0 24px 70px rgba(39, 27, 12, 0.18), 0 1px 0 rgba(255, 255, 255, 0.9) inset",
  color: "#1c1208",
  overflow: "hidden",
  backdropFilter: "blur(16px)"
};

const accentStyle: CSSProperties = {
  position: "absolute",
  inset: "0 auto auto 0",
  width: "100%",
  height: "5px",
  background:
    "linear-gradient(90deg, #f4a261 0%, #f7c873 38%, #f8e5b9 100%)"
};

const eyebrowStyle: CSSProperties = {
  margin: "0 0 12px",
  fontSize: "11px",
  fontWeight: 700,
  letterSpacing: "0.22em",
  textTransform: "uppercase",
  color: "#8b5d20"
};

const primaryStyle: CSSProperties = {
  margin: "0 0 8px",
  fontSize: "20px",
  lineHeight: 1.35,
  fontWeight: 700
};

const reasonStyle: CSSProperties = {
  margin: "0 0 16px",
  fontSize: "14px",
  lineHeight: 1.6,
  color: "#5c4a38"
};

const actionsStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(88px, 1fr))",
  gap: "8px"
};

const buttonStyle: CSSProperties = {
  appearance: "none",
  border: "1px solid rgba(82, 54, 14, 0.16)",
  borderRadius: "14px",
  padding: "10px 12px",
  background: "rgba(255, 255, 255, 0.86)",
  color: "#3f2a14",
  fontSize: "12px",
  fontWeight: 600,
  lineHeight: 1.1,
  cursor: "pointer",
  transition:
    "transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease, background 160ms ease"
};

export function DecisionCard({
  primaryAction,
  reason,
  mode,
  onModeChange,
  footerActions = [],
  verification,
  onVerificationDetailsViewed,
}: DecisionCardProps) {
  return (
    <section aria-label="OpenClaw shopping decision" style={cardStyle}>
      <div style={accentStyle} />
      <p style={eyebrowStyle}>OpenClaw 购物副驾</p>
      {mode && onModeChange ? (
        <PreferenceMode value={mode} onChange={onModeChange} />
      ) : null}
      <h2 style={primaryStyle}>{primaryAction}</h2>
      {verification ? (
        <VerificationBadge
          verification={verification}
          onDetailsViewed={onVerificationDetailsViewed}
        />
      ) : null}
      <p style={reasonStyle}>{reason}</p>
      {footerActions.length > 0 ? (
        <div style={actionsStyle}>
          {footerActions.map((action) => (
            <button
              key={action.label}
              type="button"
              style={buttonStyle}
              onClick={action.onClick}
            >
              {action.label}
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}
