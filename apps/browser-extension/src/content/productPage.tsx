import { useCallback, useEffect, useState } from "react";

import { PRODUCT_SELECTORS } from "../config/selectors.js";
import type {
  AsyncParseResult,
} from "../parsers/asyncProductParser.js";
import { parseJdProductAsync } from "../parsers/asyncProductParser.js";
import { buildProductDecision } from "../recommendation/buildProductDecision.js";
import { fetchVerification } from "../recommendation/fetchVerification.js";
import { recordEvent } from "../storage/events.js";
import { loadPreferences, savePreferences } from "../storage/preferences.js";
import type { ProductPageEventType } from "../types/events.js";
import type { DecisionMode } from "../types/preferences.js";
import type {
  ProductDecisionOutput,
  ProductDecisionProps,
} from "../types/recommendation.js";
import type { ProductPageModel } from "../types/product.js";
import type { VerificationBadgeInfo } from "../types/verification.js";
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
): ProductDecisionOutput {
  return buildProductDecision(
    {
      current: model,
      alternatives,
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

  const runParse = useCallback(() => {
    setParseResult(null);
    setParseError(null);

    void parseJdProductAsync(document)
      .then((result) => {
        setParseResult(result);
        if (result.incomplete) {
          setParseError("价格信息加载超时，部分数据可能不完整");
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

    void loadPreferences()
      .then((preferences) => {
        if (active) {
          setMode(preferences.mode);
          recordProductEvent("recommendation_shown", preferences.mode);
        }
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

  const decision = parseResult
    ? buildProductPageDecision(parseResult.model, mode, parseResult.alternatives)
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
    void savePreferences({ mode: nextMode }).catch(() => undefined);
    recordProductEvent("preference_changed", nextMode);
  };

  const handleApply = () => {
    recordProductEvent("recommendation_applied", mode);

    if (suggestsAlternative && decision) {
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
    recordProductEvent("reason_viewed", mode);
  };

  const handleVerificationDetailsViewed = () => {
    recordProductEvent("verification_details_viewed", mode);
  };

  const footerActions: DecisionCardAction[] = [
    {
      label: "应用建议",
      onClick: handleApply,
    },
    {
      label: "查看原因",
      onClick: handleReasonView,
    },
    {
      label: "调整偏好",
      onClick: () => undefined,
    },
  ];

  return (
    <DecisionCard
      primaryAction={decision!.primaryAction}
      reason={decision!.reason}
      mode={mode}
      onModeChange={handleModeChange}
      footerActions={footerActions}
      verification={verification ?? undefined}
      onVerificationDetailsViewed={handleVerificationDetailsViewed}
    />
  );
}
