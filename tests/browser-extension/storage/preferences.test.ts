import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

const browserContext = vi.hoisted(() => {
  const storageState = new Map<string, unknown>();
  const area = {
    get: vi.fn(async (key?: string | string[]) => {
      if (key == null) {
        return Object.fromEntries(storageState.entries());
      }

      if (Array.isArray(key)) {
        return Object.fromEntries(
          key.map((entry) => [entry, storageState.get(entry)]),
        );
      }

      return { [key]: storageState.get(key) };
    }),
    set: vi.fn(async (values: Record<string, unknown>) => {
      Object.entries(values).forEach(([key, value]) => {
        storageState.set(key, value);
      });
    }),
    remove: vi.fn(async (key: string | string[]) => {
      [key].flat().forEach((entry) => {
        storageState.delete(entry);
      });
    }),
    clear: vi.fn(async () => {
      storageState.clear();
    }),
    onChanged: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
  };

  const originalBrowser = (globalThis as typeof globalThis & {
    browser?: unknown;
    chrome?: unknown;
  }).browser;
  const originalChrome = (globalThis as typeof globalThis & {
    browser?: unknown;
    chrome?: unknown;
  }).chrome;

  (globalThis as typeof globalThis & {
    browser?: unknown;
    chrome?: unknown;
  }).browser = {
    runtime: { id: "openclaw-test" },
    storage: {
      local: area,
      session: area,
      sync: area,
      managed: area,
    },
  };
  (globalThis as typeof globalThis & {
    browser?: unknown;
    chrome?: unknown;
  }).chrome = undefined;

  return {
    area,
    storageState,
    originalBrowser,
    originalChrome,
  };
});

import {
  loadPreferences,
  savePreferences,
} from "../../../apps/browser-extension/src/storage/preferences.js";

describe("preferences storage", () => {
  beforeEach(() => {
    browserContext.storageState.clear();
    browserContext.area.get.mockClear();
    browserContext.area.set.mockClear();
    browserContext.area.remove.mockClear();
    browserContext.area.clear.mockClear();
  });

  it("loads the saved decision mode from extension storage", async () => {
    browserContext.storageState.set("decision-mode", "safe");

    await expect(loadPreferences()).resolves.toEqual({ mode: "safe" });
    expect(browserContext.area.get).toHaveBeenCalledWith("decision-mode");
  });

  it("falls back to time saving mode when storage is empty", async () => {
    await expect(loadPreferences()).resolves.toEqual({
      mode: "time_saving",
    });
  });

  it("persists the selected decision mode", async () => {
    await savePreferences({ mode: "value" });

    expect(browserContext.storageState.get("decision-mode")).toBe("value");
    expect(browserContext.area.set).toHaveBeenCalledWith({
      "decision-mode": "value",
    });
  });
});

afterAll(() => {
  const globalBrowser = globalThis as typeof globalThis & {
    browser?: unknown;
    chrome?: unknown;
  };

  globalBrowser.browser = browserContext.originalBrowser;
  globalBrowser.chrome = browserContext.originalChrome;
});
