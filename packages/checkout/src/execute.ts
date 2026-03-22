import type { ExecuteCheckoutInput } from "./ports.js";

export const executeCheckout = async (input: ExecuteCheckoutInput): Promise<{ orderId: string }> => {
  if (!input.holdConfirmed) {
    throw new Error("inventory_hold_required");
  }

  const authorization = await input.payment.authorize();
  if (!authorization.approved) {
    await input.payment.voidAuthorization?.();
    throw new Error("payment_rejected");
  }

  try {
    return await input.seller.commitOrder();
  } catch (error) {
    await input.seller.releaseHold?.();
    await input.payment.voidAuthorization?.();
    await input.compensate?.();
    throw error;
  }
};
