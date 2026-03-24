import { useEffect } from "react";

import { buildCartPlan } from "../recommendation/buildCartPlan.js";
import { parseJdCartDocument } from "../parsers/cartPage.js";
import { recordEvent } from "../storage/events.js";
import type { CartPageEventType } from "../types/events.js";
import type { ProductDecisionProps } from "../types/recommendation.js";
import type { CartPlanOutput } from "../types/cart.js";
import { DecisionCard } from "../ui/DecisionCard.js";

export function buildCartPagePlan(document: Document): CartPlanOutput {
  const cartModel = parseJdCartDocument(document);
  return buildCartPlan(cartModel);
}

export function toDecisionCardProps(
  decision: CartPlanOutput,
): ProductDecisionProps {
  return {
    primaryAction: decision.summary,
    reason: decision.actions.join("；"),
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

  useEffect(() => {
    recordCartEvent("cart_plan_shown");
  }, []);

  return (
    <DecisionCard
      {...toDecisionCardProps(plan)}
      footerActions={[
        {
          label: "应用建议",
          onClick: () => recordCartEvent("cart_plan_applied"),
        },
      ]}
    />
  );
}
