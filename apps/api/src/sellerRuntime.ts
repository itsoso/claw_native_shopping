import { createSellerHttpPort } from "../../../packages/seller-protocol/src/httpPort.js";
import { createSellerHttpQuoteCollector } from "../../../packages/seller-protocol/src/httpQuoteCollector.js";
import type { SellerQuoteCollector } from "../../../packages/orchestrator/src/service.js";
import type { SellerProtocolPort } from "../../../packages/seller-protocol/src/port.js";

export const DEFAULT_SELLER_SIM_BASE_URL = "http://127.0.0.1:4301";

export type SellerRuntimeOptions = {
  sellerBaseUrl?: string;
  sellerPort?: SellerProtocolPort;
  quoteCollector?: SellerQuoteCollector;
};

export type SellerRuntime = {
  sellerBaseUrl: string;
  sellerPort: SellerProtocolPort;
  quoteCollector?: SellerQuoteCollector;
};

export const resolveSellerRuntime = (
  options: SellerRuntimeOptions = {},
): SellerRuntime => {
  const configuredSellerBaseUrl =
    options.sellerBaseUrl ?? process.env.SELLER_SIM_BASE_URL;
  const sellerBaseUrl = configuredSellerBaseUrl ?? DEFAULT_SELLER_SIM_BASE_URL;

  const sellerPort =
    options.sellerPort ??
    createSellerHttpPort({
      baseUrl: sellerBaseUrl,
    });

  const quoteCollector =
    options.quoteCollector ??
    (options.sellerPort && !configuredSellerBaseUrl
      ? undefined
      : createSellerHttpQuoteCollector({
          baseUrl: sellerBaseUrl,
        }));

  return {
    sellerBaseUrl,
    sellerPort,
    ...(quoteCollector ? { quoteCollector } : {}),
  };
};
