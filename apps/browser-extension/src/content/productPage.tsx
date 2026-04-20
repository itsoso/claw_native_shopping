import { useEffect, useState } from "react";

import { parseJdProductDocument } from "../parsers/productPage.js";
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
import type { VerificationBadgeInfo } from "../types/verification.js";
import { DecisionCard } from "../ui/DecisionCard.js";
import type { DecisionCardAction } from "../ui/DecisionCard.js";

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
  rootDocument: Document,
  mode: DecisionMode = "time_saving",
): ProductDecisionOutput {
  const currentProduct = parseJdProductDocument(rootDocument);

  return buildProductDecision(
    {
      current: currentProduct,
      alternatives: [],
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
  const [verification, setVerification] = useState<VerificationBadgeInfo | null>(null);

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
    let active = true;
    const product = parseJdProductDocument(document);

    void fetchVerification(product.title)
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
  }, []);

  const decision = buildProductPageDecision(document, mode);

  const handleModeChange = (nextMode: DecisionMode) => {
    setMode(nextMode);
    void savePreferences({ mode: nextMode }).catch(() => undefined);
    recordProductEvent("preference_changed", nextMode);
  };

  const handleApply = () => {
    recordProductEvent("recommendation_applied", mode);
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
      primaryAction={decision.primaryAction}
      reason={decision.reason}
      mode={mode}
      onModeChange={handleModeChange}
      footerActions={footerActions}
      verification={verification ?? undefined}
      onVerificationDetailsViewed={handleVerificationDetailsViewed}
    />
  );
}
