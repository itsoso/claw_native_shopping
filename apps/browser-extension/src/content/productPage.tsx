import { useCallback, useEffect, useState } from "react";

import { PRODUCT_SELECTORS } from "../config/selectors.js";
import type {
  AsyncParseResult,
} from "../parsers/asyncProductParser.js";
import { parseJdProductAsync } from "../parsers/asyncProductParser.js";
import { requestPriceHistory } from "../parsers/fetchPriceHistory.js";
import { buildProductDecision } from "../recommendation/buildProductDecision.js";
import { fetchVerification } from "../recommendation/fetchVerification.js";
import { recordEvent } from "../storage/events.js";
import { getEffectiveMode, savePreferences } from "../storage/preferences.js";
import { addSavingsRecord } from "../storage/savingsRecords.js";
import { recordViewedProduct } from "../storage/viewedProducts.js";
import type { ProductPageEventType } from "../types/events.js";
import type { DecisionMode } from "../types/preferences.js";
import type {
  ProductDecisionOutput,
  ProductDecisionProps,
} from "../types/recommendation.js";
import type { PriceHistoryInfo } from "../types/product.js";
import type { ProductPageModel } from "../types/product.js";
import type { VerificationBadgeInfo } from "../types/verification.js";
import { ComparisonTable } from "../ui/ComparisonTable.js";
import { DecisionCard } from "../ui/DecisionCard.js";
import type { DecisionCardAction } from "../ui/DecisionCard.js";
import { ParserStatusCard } from "../ui/ParserStatusCard.js";
import { highlightAndScroll } from "./highlight.js";

const FALLBACK_DECISION_MODE: DecisionMode = "time_saving";

function recordProductEvent(
  type: ProductPageEventType,
  mode: DecisionMode,
): void {
  void recordEvent({
    type,
    surface: "product_page",
    mode,
  }).catch(() => undefined);
}

export function buildProductPageDecision(
  model: ProductPageModel,
  mode: DecisionMode = "time_saving",
  alternatives: ProductPageModel[] = [],
  priceHistoryInfo?: PriceHistoryInfo | undefined,
): ProductDecisionOutput {
  return buildProductDecision(
    {
      current: model,
      alternatives,
      priceHistory: priceHistoryInfo,
    },
    { mode },
  );
}

export function toDecisionCardProps(
  decision: ProductDecisionOutput,
): ProductDecisionProps {
  return {
    primaryAction: decision.primaryAction,
    reason: decision.reason
  };
}

export function ProductPagePanel() {
  const [mode, setMode] = useState<DecisionMode>(FALLBACK_DECISION_MODE);
  const [parseResult, setParseResult] = useState<AsyncParseResult | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [verification, setVerification] = useState<VerificationBadgeInfo | null>(null);
  const [priceHistory, setPriceHistory] = useState<PriceHistoryInfo | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [reasonExpanded, setReasonExpanded] = useState(false);
  const [autoModeHint, setAutoModeHint] = useState<string | null>(null);
  const [watching, setWatching] = useState(false);

  const runParse = useCallback(() => {
    setParseResult(null);
    setParseError(null);

    void parseJdProductAsync(document)
      .then((result) => {
        setParseResult(result);
        if (result.incomplete) {
          setParseError("价格信息加载超时，部分数据可能不完整");
        }
        const skuMatch = location.href.match(/\/(\d+)\.html/);
        if (skuMatch?.[1]) {
          void recordViewedProduct({
            skuId: skuMatch[1],
            title: result.model.title,
            unitPrice: result.model.unitPrice,
            effectivePrice: result.model.effectivePrice,
            sellerType: result.model.sellerType,
            url: location.href,
          }).catch(() => undefined);
        }
      })
      .catch(() => {
        setParseError("页面解析失败，暂不支持此页面");
      });
  }, []);

  useEffect(() => {
    runParse();
  }, [runParse]);

  useEffect(() => {
    let active = true;

    void getEffectiveMode()
      .then((effective) => {
        if (!active) return;
        setMode(effective.mode);
        if (effective.auto) {
          setAutoModeHint(effective.autoReason);
        }
        recordProductEvent("recommendation_shown", effective.mode);
      })
      .catch(() => {
        if (active) {
          recordProductEvent("recommendation_shown", FALLBACK_DECISION_MODE);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!parseResult) {
      return;
    }
    let active = true;

    void fetchVerification(parseResult.model.title)
      .then((result) => {
        if (active && result) {
          setVerification(result);
          recordProductEvent("verification_shown", mode);
        }
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, [parseResult]);

  useEffect(() => {
    if (!parseResult) {
      return;
    }
    let active = true;
    const skuMatch = location.href.match(/\/(\d+)\.html/);
    const skuId = skuMatch?.[1];
    if (!skuId) return;

    void requestPriceHistory(skuId)
      .then((result) => {
        if (active && result) {
          setPriceHistory(result);
          recordProductEvent("price_history_viewed", mode);
        }
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, [parseResult]);

  useEffect(() => {
    if (!parseResult) return;
    const skuMatch = location.href.match(/\/(\d+)\.html/);
    const skuId = skuMatch?.[1];
    if (!skuId) return;

    void browser.runtime
      .sendMessage({ action: "getPriceAlerts" })
      .then((response: unknown) => {
        if (
          typeof response === "object" &&
          response !== null &&
          "success" in response &&
          (response as { success: boolean }).success
        ) {
          const alerts = (response as unknown as { data: { skuId: string }[] }).data;
          if (alerts.some((a) => a.skuId === skuId)) {
            setWatching(true);
          }
        }
      })
      .catch(() => undefined);
  }, [parseResult]);

  const decision = parseResult
    ? buildProductPageDecision(parseResult.model, mode, parseResult.alternatives, priceHistory ?? undefined)
    : null;

  const suggestsAlternative = decision !== null && parseResult !== null && decision.chosen !== parseResult.model;

  useEffect(() => {
    if (suggestsAlternative) {
      recordProductEvent("alternative_suggested", mode);
    }
  }, [suggestsAlternative, mode]);

  if (!parseResult && !parseError) {
    return (
      <ParserStatusCard status="loading" message="正在分析页面..." />
    );
  }

  if (parseError && !parseResult) {
    return (
      <ParserStatusCard
        status="error"
        message={parseError}
        onRetry={runParse}
      />
    );
  }

  if (!parseResult) {
    return null;
  }

  const handleModeChange = (nextMode: DecisionMode) => {
    setMode(nextMode);
    setAutoModeHint(null);
    void savePreferences({ mode: nextMode }).catch(() => undefined);
    recordProductEvent("preference_changed", nextMode);
  };

  const handleApply = () => {
    recordProductEvent("recommendation_applied", mode);

    if (suggestsAlternative && decision) {
      const currentCost = parseResult.model.effectivePrice ?? parseResult.model.unitPrice;
      const chosenCost = decision.chosen.effectivePrice ?? decision.chosen.unitPrice;
      const savedAmount = currentCost - chosenCost;
      if (savedAmount > 0) {
        const url = parseResult.alternativeUrls[decision.chosen.title] ?? location.href;
        void addSavingsRecord({
          skuId: decision.chosen.title,
          title: decision.chosen.title,
          originalPrice: currentCost,
          savedPrice: chosenCost,
          savedAmount,
          sellerType: decision.chosen.sellerType,
          url,
        }).catch(() => undefined);
      }

      const url = parseResult.alternativeUrls[decision.chosen.title];
      if (url) {
        window.open(url, "_blank");
        return;
      }
    }

    highlightAndScroll(
      PRODUCT_SELECTORS.price.map((s) => ({ selector: s })).concat(
        PRODUCT_SELECTORS.delivery.map((s) => ({ selector: s })),
        PRODUCT_SELECTORS.selfBadge.map((s) => ({ selector: s })),
      ),
    );
  };

  const handleReasonView = () => {
    if (!reasonExpanded) {
      recordProductEvent("reason_viewed", mode);
    }
    setReasonExpanded((prev) => !prev);
  };

  const handleVerificationDetailsViewed = () => {
    recordProductEvent("verification_details_viewed", mode);
  };

  const hasAlternatives = parseResult.alternatives.length > 0;

  const handleComparisonToggle = () => {
    if (!showComparison) {
      recordProductEvent("comparison_viewed", mode);
    }
    setShowComparison((prev) => !prev);
  };

  const handleWatchPrice = () => {
    if (watching) return;
    const skuMatch = location.href.match(/\/(\d+)\.html/);
    const skuId = skuMatch?.[1];
    if (!skuId) return;

    const currentPrice = parseResult.model.effectivePrice ?? parseResult.model.unitPrice;
    const defaultTarget = Math.floor(currentPrice * 0.9 * 100) / 100;
    const priceLabel = parseResult.model.effectivePrice != null && parseResult.model.effectivePrice < parseResult.model.unitPrice
      ? `到手价 ¥${currentPrice.toFixed(2)}`
      : `当前价格 ¥${currentPrice.toFixed(2)}`;
    const input = window.prompt(
      `${priceLabel}，设置目标价：`,
      String(defaultTarget),
    );
    if (!input) return;

    const targetPrice = Number.parseFloat(input);
    if (!Number.isFinite(targetPrice) || targetPrice <= 0) return;

    void browser.runtime
      .sendMessage({
        action: "addPriceAlert",
        alert: {
          skuId,
          title: parseResult.model.title,
          url: location.href,
          targetPrice,
          currentPriceAtCreation: currentPrice,
          sellerType: parseResult.model.sellerType,
        },
      })
      .then(() => {
        setWatching(true);
        recordProductEvent("price_alert_created", mode);
      })
      .catch(() => undefined);
  };

  const footerActions: DecisionCardAction[] = [
    {
      label: "应用建议",
      onClick: handleApply,
    },
    {
      label: reasonExpanded ? "收起原因" : "查看原因",
      onClick: handleReasonView,
    },
    ...(hasAlternatives
      ? [{ label: showComparison ? "收起对比" : "对比详情", onClick: handleComparisonToggle }]
      : []),
    {
      label: "调整偏好",
      onClick: () => undefined,
    },
    {
      label: watching ? "已关注" : "关注降价",
      onClick: handleWatchPrice,
    },
  ];

  return (
    <>
      <DecisionCard
        primaryAction={decision!.primaryAction}
        reason={decision!.reason}
        mode={mode}
        onModeChange={handleModeChange}
        footerActions={footerActions}
        verification={verification ?? undefined}
        onVerificationDetailsViewed={handleVerificationDetailsViewed}
        priceTrend={priceHistory ?? undefined}
        promotions={parseResult.model.promotions}
        effectivePrice={parseResult.model.effectivePrice}
        explanation={decision!.explanation}
        showExplanation={reasonExpanded}
        autoModeHint={autoModeHint ?? undefined}
      />
      {showComparison && hasAlternatives ? (
        <ComparisonTable
          current={parseResult.model}
          alternatives={parseResult.alternatives}
          chosen={decision!.chosen}
          alternativeUrls={parseResult.alternativeUrls}
          mode={mode}
        />
      ) : null}
    </>
  );
}
