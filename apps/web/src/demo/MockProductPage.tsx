import { useState, type CSSProperties } from "react";

import { ComparisonTable } from "@extension/ui/ComparisonTable.js";
import { DecisionCard } from "@extension/ui/DecisionCard.js";
import type { DecisionMode } from "@extension/types/preferences.js";
import type { DemoProduct } from "./products.js";

type MockProductPageProps = {
  product: DemoProduct;
};

const pageStyle: CSSProperties = {
  position: "relative",
  background: "#fff",
  borderRadius: "12px",
  overflow: "hidden",
  minHeight: "520px",
};

const layoutStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "340px 1fr",
  gap: "0",
};

const imageAreaStyle: CSSProperties = {
  background: "#f5f5f5",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "24px",
  borderRight: "1px solid #eee",
};

const mainImageStyle: CSSProperties = {
  width: "280px",
  height: "280px",
  borderRadius: "8px",
  background: "linear-gradient(135deg, #fef3c7, #fde68a)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "48px",
  color: "#d97706",
  marginBottom: "12px",
};

const thumbRowStyle: CSSProperties = {
  display: "flex",
  gap: "8px",
};

const thumbStyle: CSSProperties = {
  width: "48px",
  height: "48px",
  borderRadius: "4px",
  background: "#e5e5e5",
  border: "1px solid #ddd",
};

const detailAreaStyle: CSSProperties = {
  padding: "20px 24px",
  color: "#333",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
};

const titleStyle: CSSProperties = {
  margin: "0 0 12px",
  fontSize: "18px",
  fontWeight: 700,
  lineHeight: 1.5,
  color: "#1a1a1a",
};

const priceRowStyle: CSSProperties = {
  background: "#fef2f2",
  padding: "12px 16px",
  borderRadius: "8px",
  marginBottom: "16px",
};

const priceStyle: CSSProperties = {
  fontSize: "28px",
  fontWeight: 700,
  color: "#e4393c",
};

const priceSymbolStyle: CSSProperties = {
  fontSize: "16px",
  fontWeight: 600,
  color: "#e4393c",
};

const infoGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "70px 1fr",
  gap: "8px 0",
  fontSize: "13px",
  lineHeight: 1.8,
  color: "#666",
  borderTop: "1px solid #eee",
  paddingTop: "14px",
};

const infoLabelStyle: CSSProperties = {
  color: "#999",
};

const sellerTagStyle: CSSProperties = {
  display: "inline-block",
  padding: "1px 6px",
  borderRadius: "3px",
  fontSize: "11px",
  fontWeight: 600,
  marginLeft: "6px",
};

const overlayStyle: CSSProperties = {
  position: "absolute",
  bottom: "16px",
  right: "16px",
  zIndex: 10,
  filter: "drop-shadow(0 8px 32px rgba(0,0,0,0.12))",
};

const categoryIcons: Record<string, string> = {
  粮油调味: "🌾",
  休闲零食: "🥩",
  生鲜水产: "🦀",
  新鲜水果: "🍎",
};

export function MockProductPage({ product }: MockProductPageProps) {
  const [mode, setMode] = useState<DecisionMode>(product.recommendation.mode);
  const [showComparison, setShowComparison] = useState(false);

  const selfOperated = product.sellerType === "self_operated";
  const sellerTagColor = selfOperated
    ? { background: "#fef2f2", color: "#e4393c" }
    : { background: "#f0f9ff", color: "#0369a1" };

  const hasAlternatives = product.alternatives.length > 0;
  const currentModel = {
    title: product.title,
    unitPrice: product.price,
    sellerType: product.sellerType,
    deliveryEta: product.deliveryEta,
    packageLabel: product.specs,
  };

  return (
    <div style={pageStyle}>
      <div style={layoutStyle}>
        <div style={imageAreaStyle}>
          <div style={mainImageStyle}>
            {categoryIcons[product.category] ?? "📦"}
          </div>
          <div style={thumbRowStyle}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} style={thumbStyle} />
            ))}
          </div>
        </div>

        <div style={detailAreaStyle}>
          <h3 style={titleStyle}>{product.title}</h3>

          <div style={priceRowStyle}>
            <span style={priceSymbolStyle}>¥</span>
            <span style={priceStyle}>{product.price.toFixed(2)}</span>
          </div>

          <div style={infoGridStyle}>
            <span style={infoLabelStyle}>配送</span>
            <span>{product.deliveryEta}</span>

            <span style={infoLabelStyle}>店铺</span>
            <span>
              {product.sellerName}
              <span style={{ ...sellerTagStyle, ...sellerTagColor }}>
                {selfOperated ? "自营" : "第三方"}
              </span>
            </span>

            <span style={infoLabelStyle}>规格</span>
            <span>{product.specs}</span>

            <span style={infoLabelStyle}>分类</span>
            <span>{product.category}</span>
          </div>
        </div>
      </div>

      <div style={overlayStyle}>
        <DecisionCard
          primaryAction={product.recommendation.primaryAction}
          reason={product.recommendation.reason}
          mode={mode}
          onModeChange={setMode}
          verification={product.verification}
          priceTrend={product.priceHistory}
          footerActions={[
            { label: "应用建议" },
            { label: "查看详情" },
            ...(hasAlternatives
              ? [{ label: showComparison ? "收起对比" : "对比详情", onClick: () => setShowComparison((p) => !p) }]
              : []),
          ]}
        />
        {showComparison && hasAlternatives ? (
          <ComparisonTable
            current={currentModel}
            alternatives={product.alternatives}
            chosen={currentModel}
            alternativeUrls={product.alternativeUrls}
            mode={mode}
          />
        ) : null}
      </div>
    </div>
  );
}
