export type FulfillmentEventInput = {
  now: string;
  deadline: string;
  status: "in_transit" | "delivered" | "damaged" | "pending";
};

export type FulfillmentEvaluationResult = {
  action: "open_exception" | "monitor";
  reasons: string[];
};

const toTime = (value: string): number => new Date(value).getTime();

export const evaluateFulfillmentEvents = (
  input: FulfillmentEventInput
): FulfillmentEvaluationResult => {
  const reasons: string[] = [];
  const now = toTime(input.now);
  const deadline = toTime(input.deadline);

  if (input.status === "damaged") {
    reasons.push("damaged");
  }

  if (input.status === "in_transit" && now > deadline) {
    reasons.push("late_delivery");
  }

  return {
    action: reasons.length > 0 ? "open_exception" : "monitor",
    reasons
  };
};
