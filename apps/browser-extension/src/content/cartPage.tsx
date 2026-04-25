import { useEffect, useState } from "react";

import { CART_SELECTORS } from "../config/selectors.js";
import { buildCartPlan } from "../recommendation/buildCartPlan.js";
import { parseJdCartDocument } from "../parsers/cartPage.js";
import { recordEvent } from "../storage/events.js";
import {
  dismissPriceDrop,
  readActivePriceDrops,
} from "../storage/priceDrops.js";
import type { CartPageEventType } from "../types/events.js";
import type { PriceDrop } from "../types/priceDrop.js";
import type { ProductDecisionProps } from "../types/recommendation.js";
import type { CartPlanOutput } from "../types/cart.js";
import { DecisionCard } from "../ui/DecisionCard.js";
import { PriceDropDialog } from "../ui/PriceDropDialog.js";
import { highlightAndScroll } from "./highlight.js";

export function buildCartPagePlan(document: Document): CartPlanOutput {
  const cartModel = parseJdCartDocument(document);
  return buildCartPlan(cartModel);
}

export function toDecisionCardProps(
  decision: CartPlanOutput,
): ProductDecisionProps {
  const reason = decision.actions.join("；");
  const discountNote = decision.discount != null && decision.effectiveTotal != null
    ? `（省 ¥${decision.discount.toFixed(2)}，到手 ¥${decision.effectiveTotal.toFixed(2)}）`
    : "";
  return {
    primaryAction: decision.summary,
    reason: reason + discountNote,
  };
}

function recordCartEvent(type: CartPageEventType): void {
  void recordEvent({
    type,
    surface: "cart_page",
  }).catch(() => undefined);
}

export function CartPagePanel() {
  const plan = buildCartPagePlan(document);
  const [priceDrops, setPriceDrops] = useState<PriceDrop[]>([]);
  const [showPriceDropDialog, setShowPriceDropDialog] = useState(false);

  useEffect(() => {
    recordCartEvent("cart_plan_shown");
  }, []);

  useEffect(() => {
    let active = true;
    void readActivePriceDrops()
      .then((drops) => {
        if (active) setPriceDrops(drops);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  const refreshPriceDrops = () => {
    void readActivePriceDrops()
      .then(setPriceDrops)
      .catch(() => undefined);
  };

  const handleOpenPriceDrops = () => {
    setShowPriceDropDialog(true);
    recordCartEvent("price_drop_dialog_opened");
  };

  const handleClosePriceDrops = () => {
    setShowPriceDropDialog(false);
  };

  const handleApplyPriceGuard = (drop: PriceDrop) => {
    recordCartEvent("price_guard_opened");
    void dismissPriceDrop(drop.skuId)
      .then(refreshPriceDrops)
      .catch(() => undefined);
    window.open(
      `https://jprice.jd.com/bybr/p.action?sku=${encodeURIComponent(drop.skuId)}`,
      "_blank",
    );
  };

  const handleDismissPriceDrop = (drop: PriceDrop) => {
    void dismissPriceDrop(drop.skuId)
      .then(() => {
        refreshPriceDrops();
        recordCartEvent("price_drop_dismissed");
      })
      .catch(() => undefined);
  };

  return (
    <>
      <DecisionCard
        {...toDecisionCardProps(plan)}
        footerActions={[
          {
            label: "应用建议",
            onClick: () => {
              recordCartEvent("cart_plan_applied");
              highlightAndScroll(
                CART_SELECTORS.item.map((s) => ({ selector: s })).concat(
                  CART_SELECTORS.promotionRule.map((s) => ({ selector: s })),
                ),
              );
            },
          },
          ...(priceDrops.length > 0
            ? [{
                label: `降价 ${priceDrops.length}`,
                onClick: handleOpenPriceDrops,
              }]
            : []),
        ]}
      />
      {showPriceDropDialog ? (
        <PriceDropDialog
          drops={priceDrops}
          onApply={handleApplyPriceGuard}
          onDismiss={handleDismissPriceDrop}
          onClose={handleClosePriceDrops}
        />
      ) : null}
    </>
  );
}
