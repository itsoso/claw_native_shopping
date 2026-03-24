# OpenClaw Shopping Copilot MVP

Chrome-compatible JD shopping copilot MVP for `个护家清 + 日用品复购`. The extension injects an inline decision card on `京东` product and cart pages, keeps decision mode and validation events local-first, and uses deterministic rules instead of model calls.

## What It Covers

- JD product pages: one-line recommendation, reason view, and decision mode switching
- JD cart pages: one executable cart plan with a single apply action
- Local-first storage: preferences and validation events stay in extension storage
- Browser smoke tests: Playwright verifies the injected UI against static JD fixtures

## Local Setup

```bash
pnpm install
pnpm build
pnpm test
pnpm test:e2e
```

For iterative extension work, run:

```bash
pnpm dev
```

## Load In Chrome

1. Run `pnpm build` or keep `pnpm dev` running.
2. Open `chrome://extensions`.
3. Enable `Developer mode`.
4. Choose `Load unpacked`.
5. Select `apps/browser-extension/.output/chrome-mv3`.
6. Open a supported 京东 product page or cart page and confirm the OpenClaw card appears in the bottom-right corner.

## Operator Workflow

1. Validate on JD item pages first.
2. Switch between `更省时间` / `更稳妥` / `更划算` and confirm the recommendation updates.
3. Move to the cart page and confirm the executable cart plan renders with only one apply action.
4. Run `pnpm test:e2e` before sharing a build with operators.

## Local Event Data

Validation data is stored in extension-local storage through `chrome.storage.local`.

- Decision mode key: `decision-mode`
- Event history keys: `event-history:<timestamp>:<sequence>`

To inspect the stored values during operator validation:

1. Open Chrome DevTools on a page where the extension is active.
2. Switch the console execution context to the extension content script.
3. Run `await chrome.storage.local.get(null)` and inspect the event history entries.

## Success Signals

Track the MVP against these signals:

- `recommendation acceptance rate`
- `cart plan application rate`
- `weekly repeat usage`

The detailed checklist lives in [`docs/mvp-validation-checklist.md`](docs/mvp-validation-checklist.md).
