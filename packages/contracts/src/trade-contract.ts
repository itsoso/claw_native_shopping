import { z } from "zod";
import { OfferSchema } from "./offer.js";

export const TradeContractSchema = z.object({
  id: z.string(),
  buyerAgentId: z.string(),
  sellerAgentId: z.string(),
  acceptedOffer: OfferSchema,
  paymentTerms: z.string(),
  fulfillmentSla: z.record(z.unknown()).default({}),
  disputePolicy: z.string().optional(),
  eventLedger: z.array(z.string()).default([])
});

export type TradeContract = z.infer<typeof TradeContractSchema>;
