# Beacon Demo Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a safe, Figma-faithful, interactive Beacon demo covering onboarding through monitored walk completion and panic alert.

**Architecture:** A React Router application renders focused mobile screens inside a shared phone shell. A reducer-backed journey store owns validated, locally persisted demo state, while a deterministic simulation hook with an injectable clock derives separate journey ETA and check-in deadlines without external services.

**Tech Stack:** React 19, TypeScript, Vite, React Router, Vitest, Testing Library, Playwright, CSS, Lucide React.

---

## File Structure

- `src/app/App.tsx`: route tree and route guards.
- `src/app/AppProviders.tsx`: router-independent provider composition.
- `src/features/journey/types.ts`: journey domain types.
- `src/features/journey/defaults.ts`: deterministic demo fixtures.
- `src/features/journey/reducer.ts`: journey state transitions and invariants.
- `src/features/journey/persistence.ts`: validated local storage adapter.
- `src/features/journey/JourneyProvider.tsx`: reducer context and actions.
- `src/features/journey/useWalkSimulation.ts`: countdown and progress derivation.
- `src/features/journey/clock.ts`: production and fake-clock-compatible time interface.
- `src/components/*`: reusable Beacon primitives and visual shell.
- `src/screens/*`: one focused component per demo screen.
- `src/styles/*`: tokens, reset, shell, components, and screens.
- `src/test/*`: test setup and reusable render helpers.
- `e2e/beacon-flow.spec.ts`: primary and panic browser flows.

## Chunk 1: Foundation and Domain

### Task 1: Scaffold the tested application

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `vite.config.ts`
- Create: `vitest.config.ts`
- Create: `playwright.config.ts`
- Create: `tsconfig.json`
- Create: `tsconfig.app.json`
- Create: `tsconfig.node.json`
- Create: `.gitignore`
- Create: `src/main.tsx`
- Create: `src/app/App.tsx`
- Create: `src/test/setup.ts`
- Create: `src/app/App.smoke.test.tsx`

- [ ] Add React/Vite scripts for `dev`, `build`, `test`, and `test:e2e` with pinned dependencies.
- [ ] Install dependencies with `npm install`, run `npm run dev -- --host 127.0.0.1`, and verify the process reports a local URL without startup errors.
- [ ] Add the Vitest DOM setup, write a smoke test that first fails because `App` is absent, then add a minimal `App.tsx` that renders the Beacon heading and makes the smoke test pass.
- [ ] Commit with `chore: scaffold Beacon demo`.

### Task 2: Implement the journey state machine test-first

**Files:**
- Create: `src/features/journey/types.ts`
- Create: `src/features/journey/defaults.ts`
- Create: `src/features/journey/reducer.ts`
- Create: `src/features/journey/reducer.test.ts`

- [ ] Write reducer tests for profile, trusted contact, destination selection, starting a walk, acknowledging check-in, panic, arrival, and reset.
- [ ] Run `npm test -- src/features/journey/reducer.test.ts` and verify the missing implementation fails.
- [ ] Implement discriminated actions and state invariants with no side effects.
- [ ] Re-run the focused test and verify all transitions pass.
- [ ] Commit with `feat: add Beacon journey state machine`.

### Task 3: Add safe persistence and simulation

**Files:**
- Create: `src/features/journey/persistence.ts`
- Create: `src/features/journey/persistence.test.ts`
- Create: `src/features/journey/JourneyProvider.tsx`
- Create: `src/features/journey/useWalkSimulation.ts`
- Create: `src/features/journey/clock.ts`
- Create: `src/features/journey/useWalkSimulation.test.tsx`

- [ ] Write tests proving valid state round-trips and corrupt or version-mismatched state falls back to defaults.
- [ ] Implement guarded JSON parsing and versioned storage.
- [ ] Write manual-clock tests for a ten-minute ETA, check-in due at minute six, expiry after sixty seconds, and stopped clocks after arrival.
- [ ] Implement the injectable clock, provider, and simulation hook, persisting only serializable domain state.
- [ ] Run `npm test` and verify the domain suite passes.
- [ ] Commit with `feat: persist and simulate Beacon journeys`.

## Chunk 2: Figma-Faithful Interface

### Task 4: Extract exact Figma references and build visual primitives

**Files:**
- Create: `docs/figma-node-map.md`
- Create: `public/assets/*` for Figma-provided raster or SVG assets.
- Create: `src/styles/tokens.css`
- Create: `src/styles/base.css`
- Create: `src/styles/components.css`
- Create: `src/components/BeaconMark.tsx`
- Create: `src/components/PhoneShell.tsx`
- Create: `src/components/Button.tsx`
- Create: `src/components/StatusChip.tsx`
- Create: `src/components/SimulatedMap.tsx`
- Create: `src/components/DemoBadge.tsx`
- Create: `src/components/Button.test.tsx`

- [ ] For file `GM6dXPtz6paHOvvQK8spGD`, call `get_metadata` on page `0:1`, identify the exact frame IDs for Welcome, Home, Setup, Active, Check-in, Panic, Alert Sent, Arrived, and Contact Monitor, and record the name-to-node mapping in `docs/figma-node-map.md` (known starting nodes: Welcome `1:2`, Home `1:118`, Setup `1:284`).
- [ ] Call `get_design_context` and `get_screenshot` with the recorded exact node ID for every primary frame; verify each response belongs to the intended screen before coding.
- [ ] Record exact colors, typography, spacing, radii, and shadows as CSS tokens.
- [ ] Download and use Figma assets; do not create placeholders when an asset exists.
- [ ] Build the 390 px phone shell and reusable primitives with keyboard-visible focus states.
- [ ] Add `src/components/Button.test.tsx` covering accessible name, disabled state, and keyboard activation.
- [ ] Run `npm test -- src/components/Button.test.tsx` and expect PASS, then commit with `feat: add Beacon visual foundation`.

### Task 5: Build onboarding and setup screens

**Files:**
- Create: `src/screens/WelcomeScreen.tsx`
- Create: `src/screens/ProfileScreen.tsx`
- Create: `src/screens/ContactScreen.tsx`
- Create: `src/screens/HomeScreen.tsx`
- Create: `src/screens/WalkSetupScreen.tsx`
- Create: `src/screens/OnboardingScreens.test.tsx`
- Create: `src/styles/screens.css`

- [ ] Write component tests for required fields, defaults, and expected navigation actions.
- [ ] Implement each screen from the corresponding Figma reference using shared primitives.
- [ ] Confirm no form invokes a real communication service and show the demo badge near simulated actions.
- [ ] Run `npm test -- src/screens/OnboardingScreens.test.tsx` and expect PASS, then run `npm test` and expect all tests PASS.
- [ ] Commit with `feat: build Beacon onboarding and setup flow`.

### Task 6: Build active safety and contact screens

**Files:**
- Create: `src/components/CheckInDialog.tsx`
- Create: `src/components/PanicDialog.tsx`
- Create: `src/screens/ActiveWalkScreen.tsx`
- Create: `src/screens/ContactMonitorScreen.tsx`
- Create: `src/screens/ArrivalScreen.tsx`
- Create: `src/screens/ActiveWalkScreen.test.tsx`
- Create: `src/components/SafetyDialogs.test.tsx`

- [ ] Write tests for check-in acknowledgement, panic confirmation, missed-check-in warnings in both walker and monitor views, monitor panic presentation, arrival, and reset.
- [ ] Implement the active walk controls and live simulation output.
- [ ] Implement dialog focus management and explicit panic confirmation; cover accessible names, focus return, Escape behavior, and confirmation in `src/components/SafetyDialogs.test.tsx`.
- [ ] Implement contact and arrival views driven by the shared journey state.
- [ ] Run `npm test -- src/screens/ActiveWalkScreen.test.tsx src/components/SafetyDialogs.test.tsx` and expect PASS, then run `npm test` and expect all tests PASS.
- [ ] Commit with `feat: build Beacon active safety flow`.

### Task 7: Wire routes, guards, and presentation controls

**Files:**
- Modify: `src/app/App.tsx`
- Create: `src/app/AppProviders.tsx`
- Create: `src/app/RouteGuard.tsx`
- Create: `src/app/App.test.tsx`
- Modify: `src/main.tsx`

- [ ] Write route tests for the happy path and redirects when prerequisites are missing.
- [ ] Wire all screens with React Router and provider composition.
- [ ] Add a discreet persistent reset control, a `Contact view` presenter shortcut, and a `Back to walker` return route that preserve journey state.
- [ ] Ensure unknown paths recover to the correct starting route.
- [ ] Run `npm test` and expect all tests PASS; run `npm run build` and expect exit code 0 with output in `dist/`.
- [ ] Commit with `feat: connect Beacon demo routes`.

## Chunk 3: End-to-End and Visual Verification

### Task 8: Verify primary and panic flows in a browser

**Files:**
- Create: `e2e/beacon-flow.spec.ts`
- Create: `src/components/DemoTimeControls.tsx`
- Create: `src/components/DemoTimeControls.test.tsx`
- Modify: `playwright.config.ts`
- Modify: `src/features/journey/clock.ts`
- Modify: `src/features/journey/JourneyProvider.tsx`
- Modify: `src/app/App.tsx`

- [ ] Write `src/components/DemoTimeControls.test.tsx` proving controls are absent by default and call the injected manual clock only when `VITE_DEMO_CONTROLS=true`.
- [ ] Expose a development/test-only `Advance demo time` control when `VITE_DEMO_CONTROLS=true`; use it to advance the injected clock exactly six minutes and then sixty seconds without wall-clock waits.
- [ ] Write a primary E2E test from Welcome through Arrival, including refresh after starting and verification that destination and active state persist.
- [ ] Write a missed-check-in E2E branch that advances six minutes plus sixty seconds and verifies the warning in both walker and contact views.
- [ ] Write a panic branch test that verifies the contact monitor receives the simulated alert state.
- [ ] Run `npx playwright install chromium` if Chromium is unavailable.
- [ ] Configure the Playwright web server command with `VITE_DEMO_CONTROLS=true`, run `npm run test:e2e`, and expect all Chromium scenarios PASS; fix only observable product defects.
- [ ] Commit with `test: cover Beacon demo flows`.

### Task 9: Validate responsive and Figma fidelity

**Files:**
- Modify: `src/styles/*.css` as required by comparison.
- Create: `README.md`

- [ ] Run `npm run dev -- --host 127.0.0.1`, then use Playwright screenshots at 390x844 for every primary state and save them under `artifacts/screenshots/`.
- [ ] Compare each local screenshot against its matching entry in `docs/figma-node-map.md`; record layout, type, color, spacing, and asset corrections in `artifacts/screenshots/visual-check.md` and resolve all high-impact mismatches.
- [ ] Run Playwright viewport checks at 360x800, 390x844, and 1440x1000; verify no horizontal overflow or clipped primary action.
- [ ] Run `npm test` for labels and dialog focus, then manually keyboard through the primary flow at `http://127.0.0.1:5173`; record focus order, contrast, and reduced-motion results in `artifacts/screenshots/visual-check.md`.
- [ ] Document setup, demo script, test commands, simulation limitations, and reset recovery in README.
- [ ] Run `npm test`, `npm run test:e2e` (whose configured web server enables demo controls), and `npm run build` as the final gate.
- [ ] Commit with `docs: finish Beacon demo handoff`.
