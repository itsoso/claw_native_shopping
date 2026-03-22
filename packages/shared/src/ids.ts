type Brand<T, B extends string> = T & { readonly __brand: B };

type IdFactory<T extends string> = {
  (value: string): Brand<string, T>;
  prefix: T;
};

const createIdFactory = <T extends string>(prefix: T): IdFactory<T> => {
  const factory = ((value: string) => `${prefix}_${value}` as Brand<string, T>) as IdFactory<T>;
  factory.prefix = prefix;
  return factory;
};

export type BuyerAgentId = Brand<string, "buyerAgent">;
export type SellerAgentId = Brand<string, "sellerAgent">;
export type IntentId = Brand<string, "intent">;
export type OfferId = Brand<string, "offer">;
export type OrderId = Brand<string, "order">;
export type ContractId = Brand<string, "contract">;

export const createBuyerAgentId = createIdFactory("buyerAgent");
export const createSellerAgentId = createIdFactory("sellerAgent");
export const createIntentId = createIdFactory("intent");
export const createOfferId = createIdFactory("offer");
export const createOrderId = createIdFactory("order");
export const createContractId = createIdFactory("contract");
