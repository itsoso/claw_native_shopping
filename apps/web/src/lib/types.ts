export type ScenarioId = "home" | "office";

export type DemoRunMode = "standard" | "approval" | "holdFailure";

export type InventoryCard = {
  name: string;
  onHand: number;
  reorderPoint: number;
  note: string;
};

export type ScenarioPresentation = {
  id: ScenarioId;
  tabLabel: string;
  eyebrow: string;
  heading: string;
  description: string;
  ctaLabel: string;
  policySummary: string;
  inventoryCards: InventoryCard[];
};

export type AuditEvent = {
  type: string;
  [key: string]: unknown;
};

export type OrderSnapshot = {
  orderId: string;
  status: string;
  scenarioId: ScenarioId;
  scenarioLabel?: string;
  category: string;
  sellerAgentId?: string;
  totalAmount?: number;
  requestedQuantity?: number;
  [key: string]: unknown;
};

export type ReplenishmentResult =
  | {
      status: "orderCommitted";
      orderId: string;
      explanation: string[];
      snapshot: OrderSnapshot;
    }
  | {
      status: "approvalRequired";
      orderId: string;
      reason: "approval_required";
      explanation: string[];
      snapshot: OrderSnapshot;
    }
  | {
      status: "retry";
      reason: string;
      explanation: string[];
      snapshot: OrderSnapshot;
      orderId?: string;
    };

export type OrderExplanationPayload = {
  orderId: string;
  explanation: AuditEvent[];
  snapshot: OrderSnapshot;
};

export type DemoApiClient = {
  runReplenishment(input: {
    scenarioId: ScenarioId;
    runMode: DemoRunMode;
  }): Promise<ReplenishmentResult>;
  fetchOrderExplanation(orderId: string): Promise<OrderExplanationPayload>;
};
