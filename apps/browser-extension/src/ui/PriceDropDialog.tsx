import type { CSSProperties } from "react";

import type { PriceDrop } from "../types/priceDrop.js";

type PriceDropDialogProps = {
  drops: PriceDrop[];
  onApply: (drop: PriceDrop) => void;
  onDismiss: (drop: PriceDrop) => void;
  onClose: () => void;
};

const overlayStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(20, 14, 6, 0.42)",
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "center",
  paddingTop: "12vh",
  zIndex: 999_999,
};

const dialogStyle: CSSProperties = {
  width: "min(420px, calc(100vw - 32px))",
  maxHeight: "76vh",
  overflow: "auto",
  borderRadius: "20px",
  background: "#fffaf0",
  boxShadow: "0 28px 80px rgba(35, 22, 5, 0.32)",
  padding: "20px",
  color: "#1c1208",
};

const headerStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "baseline",
  marginBottom: "12px",
};

const titleStyle: CSSProperties = {
  margin: 0,
  fontSize: "16px",
  fontWeight: 700,
};

const subtitleStyle: CSSProperties = {
  margin: "4px 0 0",
  fontSize: "12px",
  color: "#8b5d20",
};

const closeButtonStyle: CSSProperties = {
  appearance: "none",
  border: "none",
  background: "transparent",
  fontSize: "18px",
  color: "#5c4a38",
  cursor: "pointer",
  padding: "4px 8px",
};

const itemStyle: CSSProperties = {
  borderTop: "1px solid rgba(82, 54, 14, 0.1)",
  padding: "12px 0",
};

const itemTitleStyle: CSSProperties = {
  margin: "0 0 6px",
  fontSize: "14px",
  fontWeight: 600,
  color: "#3f2a14",
};

const priceLineStyle: CSSProperties = {
  margin: "0 0 8px",
  fontSize: "13px",
  lineHeight: 1.55,
  color: "#5c4a38",
};

const savedAmountStyle: CSSProperties = {
  fontWeight: 700,
  color: "#2d7a3a",
};

const buttonRowStyle: CSSProperties = {
  display: "flex",
  gap: "8px",
  flexWrap: "wrap",
};

const primaryButtonStyle: CSSProperties = {
  appearance: "none",
  border: "none",
  borderRadius: "12px",
  padding: "8px 14px",
  background: "#e4393c",
  color: "#ffffff",
  fontSize: "12px",
  fontWeight: 600,
  cursor: "pointer",
};

const secondaryButtonStyle: CSSProperties = {
  appearance: "none",
  border: "1px solid rgba(82, 54, 14, 0.2)",
  borderRadius: "12px",
  padding: "8px 14px",
  background: "transparent",
  color: "#3f2a14",
  fontSize: "12px",
  fontWeight: 600,
  cursor: "pointer",
};

const emptyStyle: CSSProperties = {
  margin: "20px 0 0",
  padding: "16px",
  borderRadius: "12px",
  background: "rgba(255, 248, 235, 0.85)",
  fontSize: "13px",
  color: "#5c4a38",
  textAlign: "center",
};

export function PriceDropDialog({
  drops,
  onApply,
  onDismiss,
  onClose,
}: PriceDropDialogProps) {
  const totalSaved = drops.reduce((sum, d) => sum + d.droppedBy, 0);

  return (
    <div role="presentation" style={overlayStyle} onClick={onClose}>
      <div
        role="dialog"
        aria-label="价保监控"
        style={dialogStyle}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={headerStyle}>
          <div>
            <p style={titleStyle}>已购商品降价</p>
            <p style={subtitleStyle}>
              {drops.length > 0
                ? `共 ${drops.length} 件可申请价保，总差价 ¥${totalSaved.toFixed(2)}`
                : "暂无降价提醒"}
            </p>
          </div>
          <button
            type="button"
            aria-label="关闭"
            onClick={onClose}
            style={closeButtonStyle}
          >
            ✕
          </button>
        </div>

        {drops.length === 0 ? (
          <p style={emptyStyle}>
            还没有 30 天内的价保提醒。在购物车或商品页"标记已购"后，我们会替你盯着到手价。
          </p>
        ) : (
          drops.map((drop) => (
            <div key={drop.skuId} style={itemStyle}>
              <p style={itemTitleStyle}>{drop.title}</p>
              <p style={priceLineStyle}>
                购入 ¥{drop.paidPrice.toFixed(2)} → 现 ¥{drop.currentPrice.toFixed(2)}
                <span style={savedAmountStyle}>
                  {" "}
                  · 可退 ¥{drop.droppedBy.toFixed(2)}
                </span>
              </p>
              <div style={buttonRowStyle}>
                <button
                  type="button"
                  style={primaryButtonStyle}
                  onClick={() => onApply(drop)}
                >
                  去申请价保
                </button>
                <button
                  type="button"
                  style={secondaryButtonStyle}
                  onClick={() => onDismiss(drop)}
                >
                  忽略
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
