import { useState, type CSSProperties } from "react";

import { DecisionCard } from "@extension/ui/DecisionCard.js";
import { demoProducts } from "./products.js";
import { MockProductPage } from "./MockProductPage.js";

const containerStyle: CSSProperties = {
  maxWidth: "1100px",
  margin: "0 auto",
  padding: "32px 24px",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
};

const headerStyle: CSSProperties = {
  textAlign: "center",
  marginBottom: "32px",
};

const h1Style: CSSProperties = {
  fontSize: "32px",
  fontWeight: 800,
  color: "#1c1208",
  margin: "0 0 8px",
};

const subtitleStyle: CSSProperties = {
  fontSize: "15px",
  color: "#8b7355",
  margin: 0,
};

const tabBarStyle: CSSProperties = {
  display: "flex",
  gap: "8px",
  marginBottom: "24px",
  flexWrap: "wrap",
};

const tabBaseStyle: CSSProperties = {
  appearance: "none",
  border: "1px solid #e5e0d8",
  borderRadius: "12px",
  padding: "10px 18px",
  fontSize: "13px",
  fontWeight: 600,
  cursor: "pointer",
  transition: "all 160ms ease",
  background: "#fff",
  color: "#5c4a38",
};

const tabSelectedStyle: CSSProperties = {
  ...tabBaseStyle,
  background: "#3f2a14",
  color: "#fffdf8",
  borderColor: "#3f2a14",
};

const sectionTitleStyle: CSSProperties = {
  fontSize: "16px",
  fontWeight: 700,
  color: "#3f2a14",
  margin: "40px 0 16px",
  paddingBottom: "8px",
  borderBottom: "2px solid #f4a261",
  display: "inline-block",
};

const comparisonGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "24px",
  marginTop: "16px",
};

const comparisonLabelStyle: CSSProperties = {
  textAlign: "center",
  fontSize: "13px",
  fontWeight: 700,
  color: "#8b7355",
  marginBottom: "12px",
  textTransform: "uppercase",
  letterSpacing: "0.1em",
};

const comparisonCellStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};

const statsBarStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "16px",
  marginTop: "32px",
};

const statCardStyle: CSSProperties = {
  background: "linear-gradient(180deg, #fffdf8 0%, #fff8eb 100%)",
  border: "1px solid rgba(244, 162, 97, 0.2)",
  borderRadius: "14px",
  padding: "18px",
  textAlign: "center",
};

const statValueStyle: CSSProperties = {
  fontSize: "28px",
  fontWeight: 800,
  color: "#3f2a14",
  margin: "0 0 4px",
};

const statLabelStyle: CSSProperties = {
  fontSize: "12px",
  color: "#8b7355",
  margin: 0,
};

export function DemoPage() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const selected = demoProducts[selectedIdx]!;

  const verifiedProduct = demoProducts.find((p) => p.verification?.grade === "A");
  const unverifiedProduct = demoProducts.find((p) => p.verification === undefined);

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <h1 style={h1Style}>OpenClaw 品质验证体验</h1>
        <p style={subtitleStyle}>
          模拟京东商品页场景，展示 Agent 如何利用品质验证数据辅助购物决策
        </p>
      </header>

      <div style={tabBarStyle}>
        {demoProducts.map((product, idx) => (
          <button
            key={product.id}
            type="button"
            style={idx === selectedIdx ? tabSelectedStyle : tabBaseStyle}
            onClick={() => setSelectedIdx(idx)}
          >
            {product.title.split(" ")[0]}
            {product.verification ? ` (${product.verification.grade}级)` : " (未验证)"}
          </button>
        ))}
      </div>

      <MockProductPage product={selected} />

      <h3 style={sectionTitleStyle}>验证 vs 无验证：Agent 推荐对比</h3>

      <div style={comparisonGridStyle}>
        <div style={comparisonCellStyle}>
          <p style={comparisonLabelStyle}>有品质验证</p>
          {verifiedProduct ? (
            <DecisionCard
              primaryAction={verifiedProduct.recommendation.primaryAction}
              reason={verifiedProduct.recommendation.reason}
              verification={verifiedProduct.verification}
              priceTrend={verifiedProduct.priceHistory}
            />
          ) : null}
        </div>
        <div style={comparisonCellStyle}>
          <p style={comparisonLabelStyle}>无品质验证</p>
          {unverifiedProduct ? (
            <DecisionCard
              primaryAction={unverifiedProduct.recommendation.primaryAction}
              reason={unverifiedProduct.recommendation.reason}
            />
          ) : null}
        </div>
      </div>

      <div style={statsBarStyle}>
        <div style={statCardStyle}>
          <p style={statValueStyle}>+34%</p>
          <p style={statLabelStyle}>验证商品推荐采纳率提升</p>
        </div>
        <div style={statCardStyle}>
          <p style={statValueStyle}>92%</p>
          <p style={statLabelStyle}>用户认为验证信息有参考价值</p>
        </div>
        <div style={statCardStyle}>
          <p style={statValueStyle}>4.8x</p>
          <p style={statLabelStyle}>验证商品详情查看倍率</p>
        </div>
      </div>
    </div>
  );
}
