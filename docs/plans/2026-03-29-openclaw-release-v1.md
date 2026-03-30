# OpenClaw Release V1 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Ship a stable, local-first OpenClaw release focused on a Chinese-first household replenishment Web experience with real local feedback and email capture.

**Architecture:** Use `apps/web` as the primary product surface, keep `apps/api` and `apps/seller-sim` as local services, and redefine repository verification around the release path rather than the legacy browser extension. Add lightweight file-backed intake endpoints so feedback and email capture are real without requiring cloud infrastructure.

**Tech Stack:** React, TypeScript, Vite, Fastify, pnpm workspace, Vitest, Playwright

---

### Task 1: Capture the Broken Baseline

**Files:**
- Modify: `docs/plans/2026-03-29-openclaw-release-v1-design.md`
- Create: `docs/reviews/2026-03-29-openclaw-release-v1-baseline.md`

**Step 1: Write the failing test**

- No new test. Use the existing baseline command.

**Step 2: Run test to verify it fails**

Run: `pnpm verify`

Expected: FAIL due to mixed release and legacy verification concerns, including JSX/type configuration and strict optional typing drift.

**Step 3: Write minimal implementation**

- record the grouped failure classes in the baseline review file
- identify which failures belong to release scope versus legacy scope

**Step 4: Run test to verify it still reproduces**

Run: `pnpm verify`

Expected: same grouped failures

**Step 5: Commit**

```bash
git add docs/plans/2026-03-29-openclaw-release-v1-design.md docs/reviews/2026-03-29-openclaw-release-v1-baseline.md
git commit -m "docs: capture release v1 baseline"
```

### Task 2: Define Release-Focused TypeScript Boundaries

**Files:**
- Create: `tsconfig.json`
- Create: `tsconfig.release.json`
- Modify: `package.json`
- Modify: `apps/web/tsconfig.json`
- Modify: `apps/browser-extension/tsconfig.json`

**Step 1: Write the failing test**

Run: `pnpm typecheck:release`

Expected: command missing or failing because the release-specific TS boundary does not exist.

**Step 2: Run test to verify it fails**

Run: `pnpm typecheck:release`

Expected: non-zero exit

**Step 3: Write minimal implementation**

- add a release-specific root tsconfig that includes:
  - `apps/web`
  - `apps/api`
  - `apps/seller-sim`
  - `packages/*`
  - release tests
- add `typecheck:release`
- keep browser-extension excluded from release gating

**Step 4: Run test to verify it passes or narrows correctly**

Run: `pnpm typecheck:release`

Expected: only true release-scope type errors remain

**Step 5: Commit**

```bash
git add tsconfig.json tsconfig.release.json package.json apps/web/tsconfig.json apps/browser-extension/tsconfig.json
git commit -m "build: add release typecheck boundary"
```

### Task 3: Restore Web and API Release Type Safety

**Files:**
- Modify: `package.json`
- Modify: `apps/api/src/routes/intents.ts`
- Modify: `apps/api/src/sellerRuntime.ts`
- Modify: `packages/orchestrator/src/service.ts`

**Step 1: Write the failing test**

Run: `pnpm typecheck:release`

Expected: FAIL on React type declarations and strict optional-property mismatches.

**Step 2: Run test to verify it fails**

Run: `pnpm typecheck:release`

Expected: same scoped failures

**Step 3: Write minimal implementation**

- add missing React type packages if needed
- fix optional-property construction to align with `exactOptionalPropertyTypes`
- avoid assigning explicit `undefined` to optional fields unless declared

**Step 4: Run test to verify it passes**

Run: `pnpm typecheck:release`

Expected: PASS

**Step 5: Commit**

```bash
git add package.json pnpm-lock.yaml apps/api/src/routes/intents.ts apps/api/src/sellerRuntime.ts packages/orchestrator/src/service.ts
git commit -m "fix: restore release type safety"
```

### Task 4: Add Real Local Intake Endpoints

**Files:**
- Create: `apps/api/src/routes/intake.ts`
- Create: `apps/api/src/intake/store.ts`
- Modify: `apps/api/src/server.ts`
- Create: `tests/integration/intake.test.ts`

**Step 1: Write the failing test**

Create tests covering:

- `POST /intake/feedback`
- `POST /intake/interest`
- validation errors for bad payloads

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/integration/intake.test.ts`

Expected: FAIL because intake endpoints do not exist.

**Step 3: Write minimal implementation**

- add file-backed local persistence
- write JSONL entries into a gitignored runtime data directory
- validate payloads with Zod

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/integration/intake.test.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add apps/api/src/routes/intake.ts apps/api/src/intake/store.ts apps/api/src/server.ts tests/integration/intake.test.ts .gitignore
git commit -m "feat: add local release intake endpoints"
```

### Task 5: Reframe the Web App as the Release Product

**Files:**
- Modify: `apps/web/src/App.tsx`
- Modify: `apps/web/src/components/Hero.tsx`
- Modify: `apps/web/src/components/ScenarioPicker.tsx`
- Modify: `apps/web/src/components/ExplanationPanel.tsx`
- Modify: `apps/web/src/styles.css`
- Create: `tests/web/release-shell.test.tsx`

**Step 1: Write the failing test**

Create a release-shell test asserting:

- Chinese household-first thesis
- household selected by default
- feedback CTA visible after run
- email CTA visible as secondary conversion

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/web/release-shell.test.tsx`

Expected: FAIL because the current UI is still validation-console shaped.

**Step 3: Write minimal implementation**

- reframe copy and layout toward product-facing release
- keep the underlying timeline/explanation strength
- move ops/runtime controls behind a secondary affordance

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/web/release-shell.test.tsx`

Expected: PASS

**Step 5: Commit**

```bash
git add apps/web/src/App.tsx apps/web/src/components/Hero.tsx apps/web/src/components/ScenarioPicker.tsx apps/web/src/components/ExplanationPanel.tsx apps/web/src/styles.css tests/web/release-shell.test.tsx
git commit -m "feat: reframe web app as release product"
```

### Task 6: Wire Feedback and Email Capture Into the Web App

**Files:**
- Create: `apps/web/src/runtime/intakeClient.ts`
- Modify: `apps/web/src/App.tsx`
- Create: `apps/web/src/components/FeedbackForm.tsx`
- Create: `apps/web/src/components/InterestForm.tsx`
- Create: `tests/web/intake-forms.test.tsx`

**Step 1: Write the failing test**

Cover:

- feedback submission success state
- email submission success state
- graceful inline validation

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/web/intake-forms.test.tsx`

Expected: FAIL because forms and intake client do not exist.

**Step 3: Write minimal implementation**

- add feedback and interest forms
- post to the new API endpoints
- show inline success and error states

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/web/intake-forms.test.tsx`

Expected: PASS

**Step 5: Commit**

```bash
git add apps/web/src/runtime/intakeClient.ts apps/web/src/components/FeedbackForm.tsx apps/web/src/components/InterestForm.tsx apps/web/src/App.tsx tests/web/intake-forms.test.tsx
git commit -m "feat: add release feedback and interest capture"
```

### Task 7: Add One-Command Local Release Startup

**Files:**
- Modify: `package.json`
- Create: `scripts/start-release.mjs`
- Create: `tests/config/start-release.test.ts`

**Step 1: Write the failing test**

Create a config-level test that verifies the release startup command exists and references Web, API, and seller simulator startup.

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/config/start-release.test.ts`

Expected: FAIL because no release startup script exists.

**Step 3: Write minimal implementation**

- add `start:release`
- orchestrate API, seller simulator, and web preview startup
- keep local ports explicit and documented

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/config/start-release.test.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add package.json scripts/start-release.mjs tests/config/start-release.test.ts
git commit -m "feat: add one-command local release startup"
```

### Task 8: Redefine Release Verification

**Files:**
- Modify: `package.json`
- Modify: `scripts/verify.sh`
- Create: `tests/config/release-verify.test.ts`

**Step 1: Write the failing test**

Assert that release verification:

- runs release typecheck
- runs release-focused vitest suites
- runs release Playwright suites

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/config/release-verify.test.ts`

Expected: FAIL because no release-specific verification contract exists.

**Step 3: Write minimal implementation**

- add `verify:release`
- make root `verify` point at the release product path
- keep legacy extension verification available under an explicit non-default command if needed

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/config/release-verify.test.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add package.json scripts/verify.sh tests/config/release-verify.test.ts
git commit -m "build: redefine release verification"
```

### Task 9: Add Release End-to-End Coverage

**Files:**
- Create: `tests/e2e/release-household-flow.spec.ts`
- Modify: `playwright.config.ts`

**Step 1: Write the failing test**

Cover:

- landing on the Web app
- running the default household scenario
- opening explanation details
- submitting feedback
- submitting email capture

**Step 2: Run test to verify it fails**

Run: `pnpm playwright test tests/e2e/release-household-flow.spec.ts`

Expected: FAIL because the new release interactions are not fully wired.

**Step 3: Write minimal implementation**

- adjust Playwright setup so the release Web flow is exercised end-to-end
- stabilize selectors around the release UI

**Step 4: Run test to verify it passes**

Run: `pnpm playwright test tests/e2e/release-household-flow.spec.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add tests/e2e/release-household-flow.spec.ts playwright.config.ts
git commit -m "test: add release household e2e flow"
```

### Task 10: Rewrite Operator and Product Docs

**Files:**
- Modify: `README.md`
- Modify: `ARCHITECTURE.md`
- Create: `docs/reviews/2026-03-29-openclaw-release-v1-conformance.md`

**Step 1: Write the failing test**

Run: `pnpm vitest run tests/config/operator-docs.test.ts`

Expected: FAIL or drift because docs do not describe the release product truthfully.

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/config/operator-docs.test.ts`

Expected: mismatch between docs and shipped behavior

**Step 3: Write minimal implementation**

- rewrite README around the release product
- align architecture doc with the actual release architecture
- record conformance against the release design

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/config/operator-docs.test.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add README.md ARCHITECTURE.md docs/reviews/2026-03-29-openclaw-release-v1-conformance.md
git commit -m "docs: align release product documentation"
```
