# OpenClaw Shopping Copilot MVP Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a Chrome-compatible browser extension MVP for JD that helps urban white-collar users make faster purchase decisions for personal care, cleaning, and daily replenishment items.

**Architecture:** Start from an empty repository and build a WXT + React extension in TypeScript. A content script detects JD product and cart pages, normalizes DOM data into product/cart models, runs a deterministic recommendation engine, and renders a lightweight inline decision card. Preferences and event data stay local-first in the MVP; no remote backend is required.

**Tech Stack:** TypeScript, WXT, React, Vitest, Playwright

---

### Task 1: Scaffold the Extension Workspace

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `wxt.config.ts`
- Create: `.gitignore`
- Create: `src/config/targets.ts`
- Create: `tests/config/targets.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { JD_CART_URL, JD_ITEM_URL } from "../../src/config/targets";

describe("JD targets", () => {
  it("locks the MVP to JD item and cart pages", () => {
    expect(JD_ITEM_URL).toBe("https://item.jd.com/*");
    expect(JD_CART_URL).toBe("https://cart.jd.com/*");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/config/targets.test.ts`
Expected: FAIL because `src/config/targets.ts` does not exist yet.

**Step 3: Write minimal implementation**

```ts
export const JD_ITEM_URL = "https://item.jd.com/*";
export const JD_CART_URL = "https://cart.jd.com/*";
```

Create `package.json` with `wxt`, `react`, `vitest`, `playwright`, `typescript`, plus `dev`, `build`, `test`, and `test:e2e` scripts. Wire `wxt.config.ts` to use the target constants for host permissions.

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/config/targets.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add package.json tsconfig.json wxt.config.ts .gitignore src/config/targets.ts tests/config/targets.test.ts
git commit -m "chore: scaffold JD shopping copilot extension"
```

### Task 2: Parse JD Product Pages into a Normalized Model

**Files:**
- Create: `src/types/product.ts`
- Create: `src/parsers/productPage.ts`
- Create: `tests/fixtures/jd/product-page.html`
- Create: `tests/parsers/productPage.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { parseJdProductPage } from "../../src/parsers/productPage";

describe("parseJdProductPage", () => {
  it("extracts the product fields required by the MVP", () => {
    const html = readFileSync("tests/fixtures/jd/product-page.html", "utf8");
    const result = parseJdProductPage(html);

    expect(result.title).toContain("洗衣液");
    expect(result.unitPrice).toBeGreaterThan(0);
    expect(result.sellerType).toBe("self_operated");
    expect(result.deliveryEta).toBeTruthy();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/parsers/productPage.test.ts`
Expected: FAIL because the parser and fixture do not exist yet.

**Step 3: Write minimal implementation**

```ts
export type ProductPageModel = {
  title: string;
  unitPrice: number;
  sellerType: "self_operated" | "marketplace";
  deliveryEta: string | null;
  packageLabel: string | null;
};
```

Implement `parseJdProductPage(html: string): ProductPageModel` with a DOM parser that reads title, price, seller type, package label, and delivery ETA from the fixture before attempting broader site coverage.

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/parsers/productPage.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/types/product.ts src/parsers/productPage.ts tests/fixtures/jd/product-page.html tests/parsers/productPage.test.ts
git commit -m "feat: parse JD product pages into normalized data"
```

### Task 3: Add the Deterministic Product Recommendation Engine

**Files:**
- Create: `src/types/preferences.ts`
- Create: `src/types/recommendation.ts`
- Create: `src/recommendation/buildProductDecision.ts`
- Create: `tests/recommendation/buildProductDecision.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { buildProductDecision } from "../../src/recommendation/buildProductDecision";

describe("buildProductDecision", () => {
  it("prefers self-operated and faster delivery in time-saving mode", () => {
    const decision = buildProductDecision(
      {
        current: { title: "洗衣液", unitPrice: 29.9, sellerType: "marketplace", deliveryEta: "后天", packageLabel: "1L" },
        alternatives: [{ title: "洗衣液", unitPrice: 31.9, sellerType: "self_operated", deliveryEta: "明天", packageLabel: "2x500mL" }],
      },
      { mode: "time_saving" },
    );

    expect(decision.primaryAction).toContain("自营");
    expect(decision.reason).toContain("明天");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/recommendation/buildProductDecision.test.ts`
Expected: FAIL because the recommendation engine does not exist yet.

**Step 3: Write minimal implementation**

```ts
export type DecisionMode = "time_saving" | "safe" | "value";

export function buildProductDecision(input, preferences) {
  return {
    primaryAction: "建议改买自营更快到货",
    reason: "明天到货，执行更稳妥",
  };
}
```

Implement deterministic scoring rules. Do not add model calls in the MVP.

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/recommendation/buildProductDecision.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/types/preferences.ts src/types/recommendation.ts src/recommendation/buildProductDecision.ts tests/recommendation/buildProductDecision.test.ts
git commit -m "feat: add deterministic JD product recommendation rules"
```

### Task 4: Render the Product Decision Card In-Page

**Files:**
- Create: `src/ui/DecisionCard.tsx`
- Create: `src/content/productPage.tsx`
- Create: `src/content/mount.tsx`
- Create: `tests/ui/DecisionCard.test.tsx`

**Step 1: Write the failing test**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DecisionCard } from "../../src/ui/DecisionCard";

describe("DecisionCard", () => {
  it("renders the one-line recommendation and three actions", () => {
    render(
      <DecisionCard
        primaryAction="建议买 2 瓶装自营版"
        reason="今天下单明天到"
      />
    );

    expect(screen.getByText("建议买 2 瓶装自营版")).toBeTruthy();
    expect(screen.getByRole("button", { name: "应用建议" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "查看原因" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "调整偏好" })).toBeTruthy();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/ui/DecisionCard.test.tsx`
Expected: FAIL because the component does not exist yet.

**Step 3: Write minimal implementation**

```tsx
export function DecisionCard(props: { primaryAction: string; reason: string }) {
  return (
    <aside>
      <p>{props.primaryAction}</p>
      <small>{props.reason}</small>
      <button>应用建议</button>
      <button>查看原因</button>
      <button>调整偏好</button>
    </aside>
  );
}
```

Mount the component only on supported JD product pages and keep styles local to the extension root container.

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/ui/DecisionCard.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/ui/DecisionCard.tsx src/content/productPage.tsx src/content/mount.tsx tests/ui/DecisionCard.test.tsx
git commit -m "feat: render in-page JD product decision card"
```

### Task 5: Build the Cart Optimizer

**Files:**
- Create: `src/types/cart.ts`
- Create: `src/parsers/cartPage.ts`
- Create: `src/recommendation/buildCartPlan.ts`
- Create: `src/content/cartPage.tsx`
- Create: `tests/fixtures/jd/cart-page.html`
- Create: `tests/recommendation/buildCartPlan.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { buildCartPlan } from "../../src/recommendation/buildCartPlan";

describe("buildCartPlan", () => {
  it("returns one executable cart plan instead of a loose list of tips", () => {
    const plan = buildCartPlan({
      items: [
        { title: "抽纸", unitPrice: 12, sellerType: "marketplace", quantity: 1 },
        { title: "洗衣液", unitPrice: 29.9, sellerType: "self_operated", quantity: 1 },
      ],
      thresholdRules: [{ threshold: 59, discount: 10 }],
    });

    expect(plan.summary).toContain("保留");
    expect(plan.actions.length).toBeGreaterThan(0);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/recommendation/buildCartPlan.test.ts`
Expected: FAIL because cart planning logic does not exist yet.

**Step 3: Write minimal implementation**

```ts
export function buildCartPlan(input) {
  return {
    summary: "保留 2 件，再补 1 件过满减",
    actions: ["保留洗衣液", "补 1 件抽纸"],
  };
}
```

Parse the JD cart page into a normalized cart model, then feed that model into `buildCartPlan`.

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/recommendation/buildCartPlan.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/types/cart.ts src/parsers/cartPage.ts src/recommendation/buildCartPlan.ts src/content/cartPage.tsx tests/fixtures/jd/cart-page.html tests/recommendation/buildCartPlan.test.ts
git commit -m "feat: add JD cart optimization plan"
```

### Task 6: Add Preference Modes and Local Storage

**Files:**
- Create: `src/storage/preferences.ts`
- Create: `src/ui/PreferenceMode.tsx`
- Modify: `src/ui/DecisionCard.tsx`
- Create: `tests/storage/preferences.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { loadPreferences, savePreferences } from "../../src/storage/preferences";

describe("preferences storage", () => {
  it("persists the selected decision mode", async () => {
    await savePreferences({ mode: "time_saving" });
    await expect(loadPreferences()).resolves.toEqual({ mode: "time_saving" });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/storage/preferences.test.ts`
Expected: FAIL because preferences storage does not exist yet.

**Step 3: Write minimal implementation**

```ts
const STORAGE_KEY = "openclaw_preferences";

export async function savePreferences(value) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}

export async function loadPreferences() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : { mode: "time_saving" };
}
```

Wire the selector into `DecisionCard` so users can flip between `time_saving`, `safe`, and `value`.

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/storage/preferences.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/storage/preferences.ts src/ui/PreferenceMode.tsx src/ui/DecisionCard.tsx tests/storage/preferences.test.ts
git commit -m "feat: persist shopping decision mode locally"
```

### Task 7: Record Local-First Events for Product Validation

**Files:**
- Create: `src/storage/events.ts`
- Create: `src/types/events.ts`
- Modify: `src/content/productPage.tsx`
- Modify: `src/content/cartPage.tsx`
- Create: `tests/storage/events.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { recordEvent, readEvents } from "../../src/storage/events";

describe("event storage", () => {
  it("stores recommendation acceptance events for later analysis", async () => {
    await recordEvent({ type: "product_recommendation_accepted", timestamp: 1 });
    const events = await readEvents();
    expect(events[0].type).toBe("product_recommendation_accepted");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/storage/events.test.ts`
Expected: FAIL because event storage does not exist yet.

**Step 3: Write minimal implementation**

```ts
const STORAGE_KEY = "openclaw_events";

export async function recordEvent(event) {
  const current = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  current.push(event);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
}

export async function readEvents() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
}
```

Record at least these events: recommendation shown, recommendation applied, reason viewed, preference changed, cart plan applied.

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/storage/events.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/storage/events.ts src/types/events.ts src/content/productPage.tsx src/content/cartPage.tsx tests/storage/events.test.ts
git commit -m "feat: add local-first event capture for MVP validation"
```

### Task 8: Add Browser-Level Smoke Tests

**Files:**
- Create: `playwright.config.ts`
- Create: `tests/e2e/product-page.spec.ts`
- Create: `tests/e2e/cart-page.spec.ts`
- Create: `tests/e2e/fixtures/jd-product.html`
- Create: `tests/e2e/fixtures/jd-cart.html`

**Step 1: Write the failing test**

```ts
import { expect, test } from "@playwright/test";

test("shows the decision card on a JD product fixture", async ({ page }) => {
  await page.goto("/tests/e2e/fixtures/jd-product.html");
  await expect(page.getByText("应用建议")).toBeVisible();
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm exec playwright test tests/e2e/product-page.spec.ts`
Expected: FAIL because the fixture and extension integration are not ready yet.

**Step 3: Write minimal implementation**

Create static fixtures that mirror the DOM patterns used in unit tests and load the content script in Playwright so the test can verify the injected UI.

**Step 4: Run test to verify it passes**

Run: `pnpm exec playwright test tests/e2e/product-page.spec.ts tests/e2e/cart-page.spec.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add playwright.config.ts tests/e2e/product-page.spec.ts tests/e2e/cart-page.spec.ts tests/e2e/fixtures/jd-product.html tests/e2e/fixtures/jd-cart.html
git commit -m "test: add browser smoke tests for JD shopping copilot"
```

### Task 9: Package the MVP and Write Operator Docs

**Files:**
- Create: `README.md`
- Create: `docs/mvp-validation-checklist.md`
- Modify: `package.json`
- Create: `tests/config/operator-docs.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

describe("operator docs", () => {
  it("documents the MVP success signals", () => {
    const readme = readFileSync("README.md", "utf8");
    expect(readme).toContain("pnpm dev");
    expect(readme).toContain("京东");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/config/operator-docs.test.ts`
Expected: FAIL because the docs do not exist yet.

**Step 3: Write minimal implementation**

Document how to install dependencies, run the extension, load it in Chrome, collect local event data, and evaluate these success signals:

- recommendation acceptance rate
- cart plan application rate
- weekly repeat usage

Add a packaging script such as `pnpm build`.

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/config/operator-docs.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add README.md docs/mvp-validation-checklist.md package.json
git commit -m "docs: add MVP operator guide and validation checklist"
```

## Notes for Execution

- Keep the first release local-first. Do not introduce a backend or remote LLM dependency.
- Prefer deterministic rules over model calls until the JD product/cart flows are stable.
- The product page and cart page parsers should be fixture-driven because the live JD DOM will change.
- Do not expand beyond JD, two page types, and the selected product categories until the validation metrics are healthy.
