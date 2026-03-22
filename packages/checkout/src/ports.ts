export type CheckoutPaymentPort = {
  authorize(): Promise<{ approved: boolean }>;
  voidAuthorization?(): Promise<void> | void;
};

export type CheckoutSellerPort = {
  commitOrder(): Promise<{ orderId: string }>;
  releaseHold?(): Promise<void> | void;
};

export type ExecuteCheckoutInput = {
  holdConfirmed: boolean;
  payment: CheckoutPaymentPort;
  seller: CheckoutSellerPort;
  compensate?: () => Promise<void> | void;
};
