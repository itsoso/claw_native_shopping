import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import type { Page } from "@playwright/test";

type ContentScriptName = "cart" | "product-page";

const bundlePathByName: Record<ContentScriptName, string> = {
  cart: resolve(
    process.cwd(),
    "apps/browser-extension/.output/chrome-mv3/content-scripts/cart.js",
  ),
  "product-page": resolve(
    process.cwd(),
    "apps/browser-extension/.output/chrome-mv3/content-scripts/product-page.js",
  ),
};

export async function installExtensionHarness(page: Page): Promise<void> {
  await page.addInitScript(() => {
    type StorageChange = {
      newValue?: unknown;
      oldValue?: unknown;
    };

    type StorageListener = (
      changes: Record<string, StorageChange>,
      areaName: string,
    ) => void;

    function createStorageArea(areaName: string) {
      const values = new Map<string, unknown>();
      const listeners = new Set<StorageListener>();

      const notify = (changes: Record<string, StorageChange>) => {
        listeners.forEach((listener) => {
          listener(changes, areaName);
        });
      };

      return {
        async get(keys?: string | string[]) {
          if (keys == null) {
            return Object.fromEntries(values.entries());
          }

          if (Array.isArray(keys)) {
            return Object.fromEntries(
              keys.map((key) => [key, values.get(key)]),
            );
          }

          return { [keys]: values.get(keys) };
        },
        async set(nextValues: Record<string, unknown>) {
          const changes = Object.fromEntries(
            Object.entries(nextValues).map(([key, value]) => {
              const oldValue = values.get(key);
              values.set(key, value);

              return [key, { oldValue, newValue: value }];
            }),
          );

          notify(changes);
        },
        async remove(keys: string | string[]) {
          const keysToRemove = [keys].flat();
          const changes = Object.fromEntries(
            keysToRemove.map((key) => {
              const oldValue = values.get(key);
              values.delete(key);

              return [key, { oldValue, newValue: undefined }];
            }),
          );

          notify(changes);
        },
        async clear() {
          const changes = Object.fromEntries(
            Array.from(values.entries()).map(([key, oldValue]) => [
              key,
              { oldValue, newValue: undefined },
            ]),
          );

          values.clear();
          notify(changes);
        },
        onChanged: {
          addListener(listener: StorageListener) {
            listeners.add(listener);
          },
          removeListener(listener: StorageListener) {
            listeners.delete(listener);
          },
        },
      };
    }

    const chrome = {
      runtime: {
        id: "openclaw-e2e",
        getURL(path: string) {
          if (path.endsWith(".css")) {
            return "data:text/css;charset=utf-8,";
          }

          return `data:text/plain;charset=utf-8,${encodeURIComponent(path)}`;
        },
      },
      storage: {
        local: createStorageArea("local"),
        session: createStorageArea("session"),
        sync: createStorageArea("sync"),
        managed: createStorageArea("managed"),
      },
    };

    Object.defineProperty(window, "chrome", {
      configurable: true,
      value: chrome,
    });
    Object.defineProperty(window, "browser", {
      configurable: true,
      value: undefined,
    });
  });
}

export async function injectContentScript(
  page: Page,
  contentScriptName: ContentScriptName,
): Promise<void> {
  const bundle = readFileSync(bundlePathByName[contentScriptName], "utf8");
  await page.addScriptTag({ content: bundle });
}
