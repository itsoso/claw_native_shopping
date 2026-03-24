# MVP Validation Checklist

## Goal

Confirm that the JD shopping copilot saves decision time for urban white-collar replenishment purchases without requiring a remote backend.

## Before A Session

- Run `pnpm build`
- Load `apps/browser-extension/.output/chrome-mv3` as an unpacked Chrome extension
- Confirm the extension appears on JD item and cart pages
- Clear extension-local storage if you need a clean run

## Product Page Checks

- The decision card appears on a JD item page
- The recommendation headline is visible without opening a modal
- `应用建议` works without breaking the page
- `查看原因` can be clicked
- Switching `更省时间` / `更稳妥` / `更划算` updates stored preference state

## Cart Page Checks

- The cart card appears on a JD cart page
- The summary is executable, not a loose list of tips
- Only the cart-appropriate apply action is shown
- `应用建议` records a cart-plan action event

## Event Collection

Inspect `chrome.storage.local` and verify these signals are present in the event history:

- `recommendation_shown`
- `recommendation_applied`
- `reason_viewed`
- `preference_changed`
- `cart_plan_applied`

## Success Signals

- `recommendation acceptance rate`
  Operator formula: accepted recommendation events / shown recommendation events
- `cart plan application rate`
  Operator formula: cart plan applied events / cart plan shown events
- `weekly repeat usage`
  Operator formula: count of unique users or repeated local validation sessions across a week

## Exit Criteria

- Operators can install and load the Chrome extension without code changes
- Product and cart smoke tests pass with `pnpm test:e2e`
- Local event data is inspectable after a validation session
- The three MVP success signals can be calculated from captured events
