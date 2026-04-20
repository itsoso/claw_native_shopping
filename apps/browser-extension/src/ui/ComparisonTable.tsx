import type { CSSProperties } from "react";

import type { DecisionMode } from "../types/preferences.js";
import type { ProductPageModel } from "../types/product.js";

type ComparisonTableProps = {
  current: ProductPageModel;
  alternatives: ProductPageModel[];
  chosen: ProductPageModel;
  alternativeUrls: Record<string, string>;
  mode: DecisionMode;
};

const MAX_SHOWN = 3;

const wrapperStyle: CSSProperties = {
  marginTop: "8px",
  display: "flex",
  flexDirection: "column",
  gap: "6px",
};

const itemStyle: CSSProperties = {
  padding: "10px 12px",
  borderRadius: "10px",
  background: "rgba(255, 255, 255, 0.7)",
  border: "1px solid rgba(32, 24, 15, 0.08)",
  fontSize: "12px",
  lineHeight: 1.5,
  color: "#5c4a38",
};

const chosenItemStyle: CSSProperties = {
  ...itemStyle,
  border: "2px solid #f4a261",
  background: "rgba(244, 162, 97, 0.06)",
};

const titleStyle: CSSProperties = {
  fontWeight: 700,
  fontSize: "13px",
  color: "#1c1208",
  marginBottom: "4px",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const rowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  flexWrap: "wrap",
};

const tagStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "2px 8px",
  borderRadius: "20px",
  fontSize: "11px",
  fontWeight: 600,
  lineHeight: 1,
};

function sellerTag(sellerType: ProductPageModel["sellerType"]): { label: string; style: CSSProperties } {
  if (sellerType === "self_operated") {
    return {
      label: "自营",
      style: { ...tagStyle, background: "rgba(45, 122, 58, 0.12)", color: "#2d7a3a" },
    };
  }
  return {
    label: "商家",
    style: { ...tagStyle, background: "rgba(139, 105, 20, 0.12)", color: "#8b6914" },
  };
}

function priceStyle(price: number, lowestPrice: number): CSSProperties {
  const isLowest = price <= lowestPrice;
  return {
    fontWeight: 700,
    fontSize: "13px",
    color: isLowest ? "#2d7a3a" : "#1c1208",
  };
}

function currentTag(): CSSProperties {
  return {
    ...tagStyle,
    background: "rgba(32, 24, 15, 0.08)",
    color: "#5c4a38",
  };
}

function chosenTag(): CSSProperties {
  return {
    ...tagStyle,
    background: "rgba(244, 162, 97, 0.18)",
    color: "#b36b1e",
  };
}

function renderItem(
  product: ProductPageModel,
  isCurrent: boolean,
  isChosen: boolean,
  lowestPrice: number,
  url: string | undefined,
) {
  const seller = sellerTag(product.sellerType);
  const style = isChosen ? chosenItemStyle : itemStyle;

  const titleContent = url ? (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      style={{ ...titleStyle, color: "#1c1208", textDecoration: "none" }}
    >
      {product.title}
    </a>
  ) : (
    <div style={titleStyle}>{product.title}</div>
  );

  return (
    <div key={product.title} style={style}>
      {titleContent}
      <div style={rowStyle}>
        <span style={priceStyle(product.unitPrice, lowestPrice)}>
          ¥{product.unitPrice.toFixed(2)}
        </span>
        <span style={seller.style}>{seller.label}</span>
        {product.deliveryEta ? (
          <span style={{ fontSize: "11px", color: "#6b5a48" }}>{product.deliveryEta}</span>
        ) : null}
        {isCurrent ? <span style={currentTag()}>当前</span> : null}
        {isChosen ? <span style={chosenTag()}>推荐</span> : null}
      </div>
    </div>
  );
}

export function ComparisonTable({
  current,
  alternatives,
  chosen,
  alternativeUrls,
}: ComparisonTableProps) {
  const shown = alternatives.slice(0, MAX_SHOWN);
  const allProducts = [current, ...shown];
  const lowestPrice = Math.min(...allProducts.map((p) => p.unitPrice));

  return (
    <div style={wrapperStyle}>
      {renderItem(current, true, chosen === current, lowestPrice, undefined)}
      {shown.map((alt) =>
        renderItem(alt, false, chosen === alt, lowestPrice, alternativeUrls[alt.title]),
      )}
    </div>
  );
}
