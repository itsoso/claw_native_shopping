import type { CSSProperties } from "react";

export type ParserStatusCardProps = {
  status: "loading" | "error";
  message: string;
  onRetry?: (() => void) | undefined;
};

const cardStyle: CSSProperties = {
  maxWidth: 360,
  borderRadius: 22,
  padding: "22px 26px",
  background: "linear-gradient(135deg, #1a1207, #261a0a)",
  border: "1px solid rgba(180, 140, 80, 0.18)",
  color: "#e6d5b8",
  fontFamily: "system-ui, -apple-system, sans-serif",
  fontSize: 14,
  lineHeight: 1.6,
};

const retryStyle: CSSProperties = {
  marginTop: 12,
  padding: "6px 16px",
  borderRadius: 8,
  border: "1px solid rgba(180, 140, 80, 0.3)",
  background: "rgba(180, 140, 80, 0.1)",
  color: "#e6d5b8",
  fontSize: 13,
  cursor: "pointer",
};

export function ParserStatusCard({
  status,
  message,
  onRetry,
}: ParserStatusCardProps) {
  return (
    <section aria-label="OpenClaw parser status" style={cardStyle}>
      <p>{message}</p>
      {status === "error" && onRetry ? (
        <button type="button" style={retryStyle} onClick={onRetry}>
          重试
        </button>
      ) : null}
    </section>
  );
}
