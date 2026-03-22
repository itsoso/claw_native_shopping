import { buildSellerSimServer } from "../../apps/seller-sim/src/server.js";

export const requestQuote = async (input: { category: string; quantity: number }) => {
  const app = buildSellerSimServer();

  try {
    const response = await app.inject({
      method: "POST",
      url: "/rfq",
      payload: {
        rfqId: "rfq_1",
        buyerAgentId: "buyer_1",
        category: input.category,
        quantity: input.quantity
      }
    });

    if (response.statusCode >= 400) {
      throw new Error(`seller sim request failed: ${response.statusCode}`);
    }

    return response.json();
  } finally {
    await app.close();
  }
};
