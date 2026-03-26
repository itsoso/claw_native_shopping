import { describe, expect, it } from "vitest";

import viteConfig, {
  createLiveProxyConfig,
  DEFAULT_LIVE_API_TARGET,
  DEFAULT_LIVE_SELLER_TARGET,
  LIVE_API_TARGET_ENV,
  LIVE_SELLER_TARGET_ENV,
} from "../../apps/web/vite.config.ts";

type ProxyTarget = {
  target?: string;
  rewrite?: (path: string) => string;
};

describe("web live proxy config", () => {
  it("configures matching live proxies for dev and preview", () => {
    const config = viteConfig as {
      server?: { proxy?: Record<string, string | ProxyTarget> };
      preview?: { proxy?: Record<string, string | ProxyTarget> };
    };

    const serverApiProxy = config.server?.proxy?.["/api/live"] as ProxyTarget | undefined;
    const serverSellerProxy = config.server?.proxy?.["/seller/live"] as ProxyTarget | undefined;
    const previewApiProxy = config.preview?.proxy?.["/api/live"] as ProxyTarget | undefined;
    const previewSellerProxy = config.preview?.proxy?.["/seller/live"] as ProxyTarget | undefined;

    expect(serverApiProxy?.target).toBe(DEFAULT_LIVE_API_TARGET);
    expect(serverSellerProxy?.target).toBe(DEFAULT_LIVE_SELLER_TARGET);
    expect(previewApiProxy?.target).toBe(DEFAULT_LIVE_API_TARGET);
    expect(previewSellerProxy?.target).toBe(DEFAULT_LIVE_SELLER_TARGET);
    expect(serverApiProxy?.rewrite?.("/api/live/health")).toBe("/health");
    expect(serverSellerProxy?.rewrite?.("/seller/live/health")).toBe("/health");
    expect(previewApiProxy?.rewrite?.("/api/live/intents/replenish")).toBe(
      "/intents/replenish",
    );
  });

  it("allows local proxy targets to be overridden via environment", () => {
    const config = createLiveProxyConfig({
      [LIVE_API_TARGET_ENV]: "http://127.0.0.1:4300",
      [LIVE_SELLER_TARGET_ENV]: "http://127.0.0.1:4301",
    });

    expect((config["/api/live"] as ProxyTarget | undefined)?.target).toBe(
      "http://127.0.0.1:4300",
    );
    expect((config["/seller/live"] as ProxyTarget | undefined)?.target).toBe(
      "http://127.0.0.1:4301",
    );
  });
});
