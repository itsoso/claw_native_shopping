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

The Vite server prints the local URL in the terminal. Open that URL in a browser and keep the page on screen during the walkthrough.

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

`Live` keeps the same UI but calls the local services instead of the bundled scenario fixtures.

Start the services in separate terminals:

```bash
pnpm dev:api
pnpm dev:seller-sim
```

The page expects these local endpoints:

- buyer API: `http://127.0.0.1:3000/health`
- seller simulator: `http://127.0.0.1:3100/health`

When you switch to `Live` and click `开始演示`, the runtime:

1. probes `/health` on both services
2. posts to `POST /intents/replenish`
3. reads `GET /orders/:id/explanation`
4. maps the live responses back into the same timeline UI

If either service is unavailable, the page falls back to `Demo` and shows a runtime fallback message instead of leaving the page blank.

## Investor Walkthrough

For a short 投资人 demo, use this order:

1. Open the page in `Demo`.
2. State the product in one line: OpenClaw is not a recommendation widget, it is a消费决策代理.
3. Click `开始演示` and narrate the five-step timeline from left to right.
4. Point at the `Runtime State` block to show that the system can switch between Demo and Live.
5. Switch to `Live`, confirm the two health cards are healthy, and run one more scenario.
6. If the local services are intentionally down, show the automatic fallback to Demo as proof that the page degrades safely during a meeting.

## Validation Commands

Use these commands before sharing the console:

```bash
pnpm vitest run tests/config/web-docs.test.ts
pnpm test:e2e
```

`pnpm test:e2e` runs the Playwright suite, including the browser smoke test for the web console.
