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

  const globalBrowser = globalThis as typeof globalThis & {
    browser?: unknown;
    chrome?: unknown;
  };

  const originalBrowser = globalBrowser.browser;
  const originalChrome = globalBrowser.chrome;

  globalBrowser.browser = {
    runtime: { id: "openclaw-test" },
    storage: {
      local: area,
      session: area,
      sync: area,
      managed: area,
    },
  };
  globalBrowser.chrome = undefined;

  return {
    area,
    storageState,
    originalBrowser,
    originalChrome,
  };
});

async function loadEventsModule() {
  vi.resetModules();

  return import("../../../apps/browser-extension/src/storage/events.js");
}

describe("events storage", () => {
  beforeEach(() => {
    browserContext.storageState.clear();
    browserContext.area.get.mockClear();
    browserContext.area.set.mockClear();
    browserContext.area.remove.mockClear();
    browserContext.area.clear.mockClear();
    vi.restoreAllMocks();
  });

  it("records concurrent events without losing one", async () => {
    const { readEvents, recordEvent } = await loadEventsModule();

    vi.spyOn(Date, "now")
      .mockReturnValueOnce(1000)
      .mockReturnValueOnce(1001);

    await Promise.all([
      recordEvent({
        type: "recommendation_shown",
        surface: "product_page",
        mode: "safe",
      }),
      recordEvent({
        type: "recommendation_applied",
        surface: "product_page",
        mode: "safe",
      }),
    ]);

    await expect(readEvents()).resolves.toEqual([
      expect.objectContaining({
        type: "recommendation_shown",
        surface: "product_page",
        mode: "safe",
        timestamp: 1000,
      }),
      expect.objectContaining({
        type: "recommendation_applied",
        surface: "product_page",
        mode: "safe",
        timestamp: 1001,
      }),
    ]);
  });

  it("preserves insertion order for same-millisecond event bursts", async () => {
    const { readEvents, recordEvent } = await loadEventsModule();

    vi.spyOn(Date, "now").mockReturnValue(2000);

    const expectedModes = [
      "time_saving",
      "safe",
      "value",
      "time_saving",
      "safe",
      "value",
      "time_saving",
      "safe",
      "value",
      "time_saving",
      "safe",
    ] as const;

    for (const mode of expectedModes) {
      await recordEvent({
        type: "recommendation_shown",
        surface: "product_page",
        mode,
      });
    }

    await expect(readEvents()).resolves.toEqual(
      expectedModes.map((mode) =>
        expect.objectContaining({
          type: "recommendation_shown",
          surface: "product_page",
          mode,
          timestamp: 2000,
        }),
      ),
    );
  });

  it("keeps same-millisecond events from separate module instances", async () => {
    vi.spyOn(Date, "now").mockReturnValue(3000);
    vi.spyOn(globalThis.crypto, "randomUUID")
      .mockReturnValueOnce("11111111-1111-4111-8111-111111111111")
      .mockReturnValueOnce("22222222-2222-4222-8222-222222222222")
      .mockReturnValue("33333333-3333-4333-8333-333333333333");

    const firstModule = await loadEventsModule();
    await firstModule.recordEvent({
      type: "recommendation_shown",
      surface: "product_page",
      mode: "safe",
    });

    const secondModule = await loadEventsModule();
    await secondModule.recordEvent({
      type: "cart_plan_applied",
      surface: "cart_page",
    });

    await expect(secondModule.readEvents()).resolves.toEqual([
      expect.objectContaining({
        type: "recommendation_shown",
        surface: "product_page",
        mode: "safe",
        timestamp: 3000,
      }),
      expect.objectContaining({
        type: "cart_plan_applied",
        surface: "cart_page",
        timestamp: 3000,
      }),
    ]);
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
