import type { DecisionMode } from "./preferences.js";

export type InteractionEventSurface = "product_page" | "cart_page" | "search_page";

export type ProductPageEventType =
  | "recommendation_shown"
  | "recommendation_applied"
  | "reason_viewed"
  | "preference_changed"
  | "verification_shown"
  | "verification_details_viewed"
  | "alternative_suggested"
  | "comparison_viewed"
  | "price_history_viewed"
  | "price_alert_created"
  | "price_alert_triggered"
  | "price_alert_removed"
  | "purchase_marked"
  | "price_drop_dialog_opened"
  | "price_drop_dismissed"
  | "price_guard_opened";

export type CartPageEventType =
  | "cart_plan_shown"
  | "cart_plan_applied"
  | "purchase_marked"
  | "price_drop_dialog_opened"
  | "price_drop_dismissed"
  | "price_guard_opened";

export type SearchPageEventType = "search_annotated" | "search_tag_clicked";

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

export type SearchPageInteractionEvent = InteractionEventBase & {
  type: SearchPageEventType;
  surface: "search_page";
  itemCount?: number;
};

export type InteractionEvent =
  | ProductPageInteractionEvent
  | CartPageInteractionEvent
  | SearchPageInteractionEvent;

export type ProductPageInteractionEventInput = Omit<
  ProductPageInteractionEvent,
  "timestamp"
>;

export type CartPageInteractionEventInput = Omit<
  CartPageInteractionEvent,
  "timestamp"
>;

export type SearchPageInteractionEventInput = Omit<
  SearchPageInteractionEvent,
  "timestamp"
>;

export type InteractionEventInput =
  | ProductPageInteractionEventInput
  | CartPageInteractionEventInput
  | SearchPageInteractionEventInput;
