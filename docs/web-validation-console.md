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

When you switch to `Live`, the health cards stay `Unknown` until you click `开始演示`. That click now sends the selected scenario and mode into the real buyer API request and begins the live sequence:

1. probes `/health` on both services
2. posts to `POST /intents/replenish` with the chosen `scenarioId` and `mode`
3. reads `GET /orders/:id/explanation`
4. maps the live responses back into the same timeline UI

Today the live request path is still a fixed local replenishment flow, but the selected scenario and mode now affect the backend request profile as well as the surrounding UI framing. 换句话说，当前选择已经进入 Live 请求本身，而不只是页面上的演示文案。如果任一服务不可用，页面会自动回退到 `Demo`，而不是留在空白或错误状态。

Current implementation limits:

- seller-sim now participates in the real replenishment path for quote, hold, and commit
- the Live path is still a fixed replenishment flow, not a dynamic multi-seller marketplace
- the chosen scenario and mode now change the request profile, but they do not yet introduce a fully dynamic marketplace search

## Investor Walkthrough

For a short 投资人 demo, use this order:

1. Open the page in `Demo`.
2. State the product in one line: OpenClaw is not a recommendation widget, it is a消费决策代理.
3. Click `开始演示` and narrate the five-step timeline from left to right.
4. Point at the `Runtime State` block to show that the system can switch between Demo and Live.
5. Switch to `Live`, click `开始演示`, and explain that the page is now using the local buyer API and seller-sim through Vite's same-origin proxy.
6. Explain that Live now validates a real buyer API to seller-sim replenishment path, including seller quote, hold, and commit.
7. Explain that the chosen scenario and mode now change the request profile sent to the buyer API, while the overall path is still fixed and local.
8. If your local backend targets differ from the defaults, restart the web app with `OPENCLAW_LIVE_API_TARGET` and `OPENCLAW_LIVE_SELLER_TARGET` so the same browser walkthrough still works.

## Validation Commands

Use these commands before sharing the console:

```bash
pnpm test
pnpm test:e2e
```

`pnpm test` includes the doc guards and web runtime unit tests. `pnpm test:e2e` runs the Playwright suite, including the browser smoke test for the web console in both `Demo` and `Live`. The Live browser test now starts isolated buyer API and seller-sim ports and injects them into the web proxy so the check does not depend on whatever may already be running on `3000` or `3100`.
