import { defineConfig, type ProxyOptions } from "vite";

export const DEFAULT_LIVE_API_TARGET = "http://127.0.0.1:4300";
export const DEFAULT_LIVE_SELLER_TARGET = "http://127.0.0.1:4301";
export const LIVE_API_TARGET_ENV = "OPENCLAW_LIVE_API_TARGET";
export const LIVE_SELLER_TARGET_ENV = "OPENCLAW_LIVE_SELLER_TARGET";
export const WEB_DEFAULT_HOST = "0.0.0.0";
export const WEB_DEFAULT_PORT = 4174;

const rewriteLivePath =
  (prefix: string) =>
  (path: string): string =>
    path.replace(new RegExp(`^${prefix}`), "");

export const createLiveProxyConfig = (
  env: NodeJS.ProcessEnv = process.env,
): Record<string, ProxyOptions> => {
  const apiTarget = env[LIVE_API_TARGET_ENV] ?? DEFAULT_LIVE_API_TARGET;
  const sellerTarget = env[LIVE_SELLER_TARGET_ENV] ?? DEFAULT_LIVE_SELLER_TARGET;

  return {
    "/api/live": {
      target: apiTarget,
      changeOrigin: true,
      rewrite: rewriteLivePath("/api/live"),
    },
    "/seller/live": {
      target: sellerTarget,
      changeOrigin: true,
      rewrite: rewriteLivePath("/seller/live"),
    },
  };
};

export const liveProxyConfig = createLiveProxyConfig();

export default defineConfig({
  server: {
    host: WEB_DEFAULT_HOST,
    port: WEB_DEFAULT_PORT,
    strictPort: true,
    proxy: liveProxyConfig,
  },
  preview: {
    host: WEB_DEFAULT_HOST,
    port: WEB_DEFAULT_PORT,
    strictPort: true,
    proxy: liveProxyConfig,
  },
});
