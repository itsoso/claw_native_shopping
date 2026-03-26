# OpenClaw Web Validation Console Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a single-page Web validation console that demonstrates the OpenClaw shopping-agent flow in stable demo mode and optional live mode backed by the local API and seller simulator.

**Architecture:** Add a new `apps/web` Vite + React app with a shared `RunViewModel`, plus `DemoRuntimeAdapter` and `LiveRuntimeAdapter` implementations. Extend the local API and seller simulator with simple health endpoints so the page can show service availability and degrade safely when live mode is unavailable.

**Tech Stack:** React, TypeScript, Vite, Vitest, React Testing Library, Playwright, Fastify

---

### Task 1: Scaffold the Web App Workspace

**Files:**
- Modify: `pnpm-workspace.yaml`
- Modify: `package.json`
- Create: `apps/web/package.json`
- Create: `apps/web/tsconfig.json`
- Create: `apps/web/vite.config.ts`
- Create: `apps/web/index.html`
- Create: `apps/web/src/main.tsx`
- Create: `apps/web/src/App.tsx`
- Create: `tests/web/app-shell.test.tsx`

**Step 1: Write the failing test**

```tsx
// tests/web/app-shell.test.tsx
// @vitest-environment jsdom

import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { App } from "../../apps/web/src/App.js";

describe("Web validation shell", () => {
  it("renders the thesis and the primary demo call to action", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", {
        name: /OpenClaw does not help users browse/i,
      }),
    ).toBeTruthy();
    expect(screen.getByRole("button", { name: "开始演示" })).toBeTruthy();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/web/app-shell.test.tsx`

Expected: FAIL because `apps/web` and `App` do not exist yet.

**Step 3: Write minimal implementation**

- add `apps/web` to `pnpm-workspace.yaml`
- add root scripts:
  - `dev:web`
  - `build:web`
- create a minimal Vite + React app that exports `App`
- render a single hero heading and the `开始演示` button

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/web/app-shell.test.tsx`

Expected: PASS

**Step 5: Commit**

```bash
git add pnpm-workspace.yaml package.json apps/web tests/web/app-shell.test.tsx
git commit -m "feat: scaffold web validation console"
```

### Task 2: Add Shared Scenario and Runtime Types

**Files:**
- Create: `apps/web/src/runtime/types.ts`
- Create: `apps/web/src/scenarios/index.ts`
- Create: `tests/web/runtime-types.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";

import { demoScenarios } from "../../apps/web/src/scenarios/index.js";

describe("demo scenarios", () => {
  it("ships three investor-safe preset scenarios", () => {
    expect(demoScenarios).toHaveLength(3);
    expect(demoScenarios.map((scenario) => scenario.id)).toEqual([
      "replenish-laundry",
      "optimize-cart-threshold",
      "seller-eta-tradeoff",
    ]);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/web/runtime-types.test.ts`

Expected: FAIL because the scenario registry and types do not exist.

**Step 3: Write minimal implementation**

Define:

- `ValidationRuntime = "demo" | "live"`
- `ScenarioDefinition`
- `RunStepViewModel`
- `RunViewModel`

Create a stable `demoScenarios` array with the three scenario IDs required by the design.

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/web/runtime-types.test.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add apps/web/src/runtime/types.ts apps/web/src/scenarios/index.ts tests/web/runtime-types.test.ts
git commit -m "feat: add web validation scenario model"
```

### Task 3: Implement the Demo Runtime Adapter

**Files:**
- Create: `apps/web/src/runtime/demoRuntime.ts`
- Modify: `apps/web/src/scenarios/index.ts`
- Create: `tests/web/demo-runtime.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";

import { runDemoScenario } from "../../apps/web/src/runtime/demoRuntime.js";

describe("demo runtime", () => {
  it("returns a five-step investor-facing validation flow", async () => {
    const result = await runDemoScenario("replenish-laundry", "time_saving");

    expect(result.runtime).toBe("demo");
    expect(result.steps.map((step) => step.id)).toEqual([
      "demand",
      "decision",
      "cart-plan",
      "seller-order",
      "explanation",
    ]);
    expect(result.summary).toContain("OpenClaw");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/web/demo-runtime.test.ts`

Expected: FAIL because the demo runtime does not exist.

**Step 3: Write minimal implementation**

Implement `runDemoScenario(scenarioId, mode)` using deterministic scenario fixtures that return:

- summary
- five steps
- explanation tags
- health block showing demo mode as healthy

Do not call local services in demo mode.

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/web/demo-runtime.test.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add apps/web/src/runtime/demoRuntime.ts apps/web/src/scenarios/index.ts tests/web/demo-runtime.test.ts
git commit -m "feat: add demo runtime for web validation console"
```

### Task 4: Build the Single-Page Validation UI

**Files:**
- Create: `apps/web/src/components/Hero.tsx`
- Create: `apps/web/src/components/ScenarioPicker.tsx`
- Create: `apps/web/src/components/FlowTimeline.tsx`
- Create: `apps/web/src/components/ExplanationPanel.tsx`
- Create: `apps/web/src/components/OpsDock.tsx`
- Modify: `apps/web/src/App.tsx`
- Create: `apps/web/src/styles.css`
- Create: `tests/web/validation-console.test.tsx`

**Step 1: Write the failing test**

```tsx
// @vitest-environment jsdom

import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { App } from "../../apps/web/src/App.js";

describe("validation console", () => {
  it("runs the default scenario and shows timeline steps and ops state", async () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "开始演示" }));

    await waitFor(() => {
      expect(screen.getByText("Demand")).toBeTruthy();
      expect(screen.getByText("Decision")).toBeTruthy();
      expect(screen.getByText("Demo")).toBeTruthy();
    });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/web/validation-console.test.tsx`

Expected: FAIL because the full page structure does not exist.

**Step 3: Write minimal implementation**

Build the page as a single screen with:

- hero
- scenario picker
- demo/live switch
- flow timeline
- explanation panel
- ops dock

Use the demo runtime as the initial backing runtime.

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/web/validation-console.test.tsx`

Expected: PASS

**Step 5: Commit**

```bash
git add apps/web/src/components apps/web/src/App.tsx apps/web/src/styles.css tests/web/validation-console.test.tsx
git commit -m "feat: build single-page web validation console ui"
```

### Task 5: Add Health Endpoints for the Local Services

**Files:**
- Modify: `apps/api/src/routes/intents.ts`
- Modify: `apps/seller-sim/src/handlers.ts`
- Create: `tests/integration/service-health.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";

import { startApiServer } from "../../apps/api/src/server.js";
import { startSellerSimServer } from "../../apps/seller-sim/src/server.js";

describe("service health routes", () => {
  it("exposes simple health probes for api and seller sim", async () => {
    const [{ app: api, baseUrl: apiBaseUrl }, { app: seller, baseUrl: sellerBaseUrl }] =
      await Promise.all([startApiServer({ port: 0 }), startSellerSimServer({ port: 0 })]);

    const [apiResponse, sellerResponse] = await Promise.all([
      fetch(`${apiBaseUrl}/health`).then((response) => response.json()),
      fetch(`${sellerBaseUrl}/health`).then((response) => response.json()),
    ]);

    expect(apiResponse).toEqual({ status: "ok", service: "buyer-api" });
    expect(sellerResponse).toEqual({ status: "ok", service: "seller-sim" });

    await Promise.all([api.close(), seller.close()]);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/integration/service-health.test.ts`

Expected: FAIL because the routes do not exist yet.

**Step 3: Write minimal implementation**

Add `GET /health` to:

- buyer API
- seller simulator

Return minimal stable JSON payloads for the Web `Ops Dock`.

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/integration/service-health.test.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add apps/api/src/routes/intents.ts apps/seller-sim/src/handlers.ts tests/integration/service-health.test.ts
git commit -m "feat: add health routes for live web validation"
```

### Task 6: Implement the Live Runtime Adapter

**Files:**
- Create: `apps/web/src/runtime/liveRuntime.ts`
- Modify: `apps/web/src/runtime/types.ts`
- Create: `tests/web/live-runtime.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, expect, it, vi } from "vitest";

import { createLiveRuntime } from "../../apps/web/src/runtime/liveRuntime.js";

describe("live runtime", () => {
  it("maps buyer-api and explanation responses into the shared view model", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ status: "ok", service: "buyer-api" })))
      .mockResolvedValueOnce(new Response(JSON.stringify({ status: "ok", service: "seller-sim" })))
      .mockResolvedValueOnce(new Response(JSON.stringify({ orderId: "order_1" })))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        orderId: "order_1",
        explanation: [{ event: "decision_made" }],
        snapshot: { orderId: "order_1", status: "committed" },
      })));

    const runtime = createLiveRuntime({
      apiBaseUrl: "http://127.0.0.1:3000",
      sellerBaseUrl: "http://127.0.0.1:3100",
      fetch: fetchMock as typeof fetch,
    });

    const result = await runtime.run("replenish-laundry", "safe");

    expect(result.runtime).toBe("live");
    expect(result.health.api.status).toBe("ok");
    expect(result.health.seller.status).toBe("ok");
    expect(result.steps.some((step) => step.id === "explanation")).toBe(true);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/web/live-runtime.test.ts`

Expected: FAIL because the live runtime does not exist.

**Step 3: Write minimal implementation**

Create `createLiveRuntime` that:

- probes `/health` on API and seller-sim
- posts to `/intents/replenish`
- fetches `/orders/:id/explanation`
- maps the response into `RunViewModel`

Do not add scenario-specific branching beyond what is needed for the current MVP.

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/web/live-runtime.test.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add apps/web/src/runtime/liveRuntime.ts apps/web/src/runtime/types.ts tests/web/live-runtime.test.ts
git commit -m "feat: add live runtime adapter for web validation console"
```

### Task 7: Wire Demo/Live Switching and Safe Fallback UI

**Files:**
- Modify: `apps/web/src/App.tsx`
- Modify: `apps/web/src/components/OpsDock.tsx`
- Create: `tests/web/runtime-switching.test.tsx`

**Step 1: Write the failing test**

```tsx
// @vitest-environment jsdom

import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { App } from "../../apps/web/src/App.js";

describe("runtime switching", () => {
  it("shows a clear live-mode failure state without breaking demo mode", async () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Live" }));
    fireEvent.click(screen.getByRole("button", { name: "开始演示" }));

    await waitFor(() => {
      expect(screen.getByText(/服务不可用/i)).toBeTruthy();
      expect(screen.getByText("Demo")).toBeTruthy();
    });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/web/runtime-switching.test.tsx`

Expected: FAIL because the runtime switching and fallback behavior do not exist yet.

**Step 3: Write minimal implementation**

Wire:

- runtime toggle state
- live runtime invocation
- service failure fallback copy
- clear health badges in the ops dock

Keep the app usable even when live mode fails.

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/web/runtime-switching.test.tsx`

Expected: PASS

**Step 5: Commit**

```bash
git add apps/web/src/App.tsx apps/web/src/components/OpsDock.tsx tests/web/runtime-switching.test.tsx
git commit -m "feat: add demo live switching with safe fallback"
```

### Task 8: Add Browser-Level Smoke Test for the Web Console

**Files:**
- Create: `tests/e2e/web-validation-console.spec.ts`
- Modify: `package.json`

**Step 1: Write the failing test**

```ts
import { expect, test } from "@playwright/test";

test("runs the default demo scenario in the web validation console", async ({ page }) => {
  await page.goto("http://127.0.0.1:4174");
  await page.getByRole("button", { name: "开始演示" }).click();

  await expect(page.getByText("Demand")).toBeVisible();
  await expect(page.getByText("Explanation")).toBeVisible();
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm exec playwright test tests/e2e/web-validation-console.spec.ts`

Expected: FAIL because the web app is not being served to Playwright yet.

**Step 3: Write minimal implementation**

Update Playwright or package scripts so the Web app can be built/served for the spec, then add a smoke test that verifies:

- page loads
- demo scenario runs
- timeline is visible
- ops dock renders runtime state

**Step 4: Run test to verify it passes**

Run: `pnpm exec playwright test tests/e2e/web-validation-console.spec.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add package.json tests/e2e/web-validation-console.spec.ts
git commit -m "test: add browser smoke test for web validation console"
```

### Task 9: Document the Web Demo Workflow

**Files:**
- Modify: `README.md`
- Create: `docs/web-validation-console.md`
- Create: `tests/config/web-docs.test.ts`

**Step 1: Write the failing test**

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("web validation docs", () => {
  it("documents how to run the web console in demo and live mode", () => {
    const readme = readFileSync("README.md", "utf8");
    const docs = readFileSync("docs/web-validation-console.md", "utf8");

    expect(readme).toContain("pnpm dev:web");
    expect(readme).toContain("OpenClaw Web Validation Console");
    expect(docs).toContain("Demo");
    expect(docs).toContain("Live");
    expect(docs).toContain("/health");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/config/web-docs.test.ts`

Expected: FAIL because the docs do not exist yet.

**Step 3: Write minimal implementation**

Document:

- how to start the Web app
- how to start the API and seller simulator
- how `Demo` and `Live` differ
- how to use the page in an investor demo

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/config/web-docs.test.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add README.md docs/web-validation-console.md tests/config/web-docs.test.ts
git commit -m "docs: add web validation console operator guide"
```

## Notes for Execution

- Keep the Web app self-contained. Do not make it depend on Chrome extension runtime APIs.
- Prefer pure view-model transformations and explicit adapters over component-side fetch logic.
- Reuse existing buyer API endpoints where possible; add only the minimal service-health routes needed for the ops dock.
- Use TDD for every task and keep commits small.
- After Task 9, run `pnpm build && pnpm test:e2e && pnpm test` before declaring completion.
