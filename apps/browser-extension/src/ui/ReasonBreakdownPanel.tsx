import type { CSSProperties } from "react";

import type {
  AlternativeComparison,
  DecisionExplanation,
  DecisionFactor,
  DecisionFactorKind,
} from "../types/recommendation.js";

type ReasonBreakdownPanelProps = {
  explanation: DecisionExplanation;
};

const panelStyle: CSSProperties = {
  marginTop: "12px",
  padding: "12px",
  borderRadius: "14px",
  background: "rgba(255, 253, 247, 0.85)",
  border: "1px solid rgba(82, 54, 14, 0.1)",
};

const sectionLabelStyle: CSSProperties = {
  margin: "0 0 6px",
  fontSize: "11px",
  fontWeight: 700,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: "#8b5d20",
};

const factorRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: "8px",
  padding: "6px 0",
  fontSize: "13px",
  lineHeight: 1.5,
  color: "#3f2a14",
};

const factorIconStyle: CSSProperties = {
  fontSize: "14px",
  width: "18px",
  flexShrink: 0,
  textAlign: "center",
};

const factorLabelStyle: CSSProperties = {
  fontWeight: 600,
};

const factorDetailStyle: CSSProperties = {
  color: "#6b5a48",
  fontSize: "12px",
  marginTop: "2px",
};

const altRowStyle: CSSProperties = {
  padding: "8px 0",
  fontSize: "12px",
  color: "#5c4a38",
  borderTop: "1px dashed rgba(82, 54, 14, 0.12)",
};

const altTitleStyle: CSSProperties = {
  fontWeight: 600,
  color: "#3f2a14",
  marginBottom: "2px",
};

const emptyStyle: CSSProperties = {
  margin: 0,
  fontSize: "12px",
  color: "#8b7d67",
};

const FACTOR_ICON: Record<DecisionFactorKind, string> = {
  price: "💰",
  delivery: "🚚",
  seller: "🏷️",
  price_history: "📈",
  promotion: "🎁",
};

function FactorRow({ factor }: { factor: DecisionFactor }) {
  return (
    <div style={factorRowStyle}>
      <span aria-hidden="true" style={factorIconStyle}>
        {FACTOR_ICON[factor.kind]}
      </span>
      <div>
        <div style={factorLabelStyle}>{factor.label}</div>
        {factor.detail ? <div style={factorDetailStyle}>{factor.detail}</div> : null}
      </div>
    </div>
  );
}

function summarizeAlternative(alt: AlternativeComparison): string {
  const parts: string[] = [];
  if (alt.priceDelta < 0) {
    parts.push(`更便宜 ¥${Math.abs(alt.priceDelta).toFixed(2)}`);
  } else if (alt.priceDelta > 0) {
    parts.push(`贵 ¥${alt.priceDelta.toFixed(2)}`);
  } else {
    parts.push("同价");
  }
  if (alt.deliveryDelta > 0) {
    parts.push(`物流领先 ${alt.deliveryDelta}`);
  } else if (alt.deliveryDelta < 0) {
    parts.push(`物流落后 ${Math.abs(alt.deliveryDelta)}`);
  }
  if (!alt.sameSellerType) {
    parts.push("卖家类型不同");
  }
  return parts.join(" · ");
}

function AlternativeRow({ alt }: { alt: AlternativeComparison }) {
  return (
    <div style={altRowStyle}>
      <div style={altTitleStyle}>vs {alt.title}</div>
      <div>{summarizeAlternative(alt)}</div>
    </div>
  );
}

export function ReasonBreakdownPanel({ explanation }: ReasonBreakdownPanelProps) {
  const { factors, alternatives } = explanation;

  if (factors.length === 0 && alternatives.length === 0) {
    return (
      <section aria-label="推荐理由详情" style={panelStyle}>
        <p style={emptyStyle}>本次仅基于标价推荐，暂无更多可解释数据。</p>
      </section>
    );
  }

  return (
    <section aria-label="推荐理由详情" style={panelStyle}>
      {factors.length > 0 ? (
        <>
          <p style={sectionLabelStyle}>推荐依据</p>
          {factors.map((factor) => (
            <FactorRow key={`${factor.kind}-${factor.label}`} factor={factor} />
          ))}
        </>
      ) : null}
      {alternatives.length > 0 ? (
        <>
          <p style={{ ...sectionLabelStyle, marginTop: "12px" }}>对比替代品</p>
          {alternatives.map((alt) => (
            <AlternativeRow key={alt.title} alt={alt} />
          ))}
        </>
      ) : null}
    </section>
  );
}
