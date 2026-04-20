import type { DecisionMode } from "./preferences.js";

export type InteractionEventSurface = "product_page" | "cart_page";

export type ProductPageEventType =
  | "recommendation_shown"
  | "recommendation_applied"
  | "reason_viewed"
  | "preference_changed"
  | "verification_shown"
  | "verification_details_viewed"
  | "alternative_suggested"
  | "comparison_viewed"
  | "price_history_viewed";

export type CartPageEventType = "cart_plan_shown" | "cart_plan_applied";

type InteractionEventBase = {
  timestamp: number;
};

export type ProductPageInteractionEvent = InteractionEventBase & {
  type: ProductPageEventType;
  surface: "product_page";
  mode?: DecisionMode;
};

export type CartPageInteractionEvent = InteractionEventBase & {
  type: CartPageEventType;
  surface: "cart_page";
};

export type InteractionEvent =
  | ProductPageInteractionEvent
  | CartPageInteractionEvent;

export type ProductPageInteractionEventInput = Omit<
  ProductPageInteractionEvent,
  "timestamp"
>;

export type CartPageInteractionEventInput = Omit<
  CartPageInteractionEvent,
  "timestamp"
>;

export type InteractionEventInput =
  | ProductPageInteractionEventInput
  | CartPageInteractionEventInput;
