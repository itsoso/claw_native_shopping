# OpenClaw Web Validation Console

## Purpose

The Web Validation Console is the single-page showroom for the OpenClaw shopping copilot. It is designed for two jobs at once:

- give 投资人 and partners a fast explanation of what OpenClaw does
- let operators switch from a stable Demo path to a local Live path without leaving the page

The page is a React + Vite app in `apps/web`. It presents the product story, scenario picker, flow timeline, explanation panel, and runtime health in one screen.

## Start The Console

Install dependencies once:

```bash
pnpm install
```

Run the console:

```bash
pnpm dev:web
```

The Vite server prints the local URL in the terminal. Open that URL in a browser and keep the page on screen during the walkthrough. `pnpm preview:web` exposes the same UI and the same local Live path.

## Runtime Modes

### Demo

`Demo` is the default mode and should be the first stop for any investor presentation.

- it uses the three preset scenarios bundled in `apps/web/src/scenarios/index.ts`
- it does not depend on local backend services
- it always renders a complete five-step flow after you click `开始演示`

Use Demo when you need a stable story:

1. Keep the runtime toggle on `Demo`.
2. Pick a scenario such as `补货日常洗衣液`.
3. Click `开始演示`.
4. Walk through `Demand`, `Decision`, `Cart Plan`, `Seller Order`, and `Explanation`.
5. Call out the runtime state and the explanation tags on the right-hand side.

### Live

`Live` keeps the same UI and is browser-runnable in local Vite `dev` and `preview`.

Start the services in separate terminals:

```bash
pnpm dev:api
pnpm dev:seller-sim
```

The page uses a built-in same-origin proxy and expects these default local endpoints behind it:

- buyer API: `http://127.0.0.1:3000/health`
- seller simulator: `http://127.0.0.1:3100/health`

If those ports are not suitable in your environment, override the proxy targets before starting the web app:

```bash
OPENCLAW_LIVE_API_TARGET=http://127.0.0.1:4300 \
OPENCLAW_LIVE_SELLER_TARGET=http://127.0.0.1:4301 \
pnpm dev:web
```

When you switch to `Live`, the health cards stay `Unknown` until you click `开始演示`. That click is where the runtime would begin its live sequence:

1. probes `/health` on both services
2. posts to `POST /intents/replenish`
3. reads `GET /orders/:id/explanation`
4. maps the live responses back into the same timeline UI

Today the live request path is a fixed local replenishment flow. The selected scenario and mode still shape the summary and other UI framing, but they only affect the presentation copy on screen and do not change the backend request body yet. 换句话说，当前选择只影响页面上的演示文案，不改变 Live 请求本身。如果任一服务不可用，页面会自动回退到 `Demo`，而不是留在空白或错误状态。

Current implementation limits:

- seller-sim 目前只参与 health probe，不参与当前 Live 补货路径里的实际下单编排
- the replenishment path itself still completes inside the buyer API's in-process fixture adapter

## Investor Walkthrough

For a short 投资人 demo, use this order:

1. Open the page in `Demo`.
2. State the product in one line: OpenClaw is not a recommendation widget, it is a消费决策代理.
3. Click `开始演示` and narrate the five-step timeline from left to right.
4. Point at the `Runtime State` block to show that the system can switch between Demo and Live.
5. Switch to `Live`, click `开始演示`, and explain that the page is now using the local buyer API and seller-sim through Vite's same-origin proxy.
6. Explain that Live currently validates a fixed local replenishment path, while the chosen scenario and mode only affect the presentation copy shown around that path.
7. Call out that seller-sim 目前只参与 health probe，真实补货链路仍在 buyer API 的本地 fixture adapter 内完成。
8. If your local backend targets differ from the defaults, restart the web app with `OPENCLAW_LIVE_API_TARGET` and `OPENCLAW_LIVE_SELLER_TARGET` so the same browser walkthrough still works.

## Validation Commands

Use these commands before sharing the console:

```bash
pnpm test
pnpm test:e2e
```

`pnpm test` includes the doc guards and web runtime unit tests. `pnpm test:e2e` runs the Playwright suite, including the browser smoke test for the web console in both `Demo` and `Live`. The Live browser test now starts isolated buyer API and seller-sim ports and injects them into the web proxy so the check does not depend on whatever may already be running on `3000` or `3100`.
