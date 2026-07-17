# Beacon Main Frames Two-Device Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the incorrect Beacon prototype with a Main Frames-faithful, real-time two-phone demo.

**Architecture:** A React client renders walker and receiver routes from shared typed session snapshots. An Express and WebSocket server owns in-memory sessions and broadcasts validated walker events. Vite proxies API/WebSocket traffic and a LAN startup helper prints phone-ready URLs and a receiver QR code.

**Tech Stack:** React, TypeScript, Vite, Express, ws, Vitest, Testing Library, Playwright, CSS.

---

## Chunk 1: Source Map and Real-Time Domain

### Task 1: Record exact Main Frames sources

**Files:**
- Replace: `docs/figma-node-map.md`
- Create: `docs/figma-main-frames/README.md`

- [ ] Record section `96:2`, all 29 direct frame IDs, names, semantic labels, and unique-state grouping.
- [ ] Fetch design context and screenshots for onboarding `67:14`, name `91:1948`, contacts `91:6240`/`91:6280`, Home `67:54`, setup `67:133`, active `67:339`, check-in `67:433`, panic `67:450`, alert `67:521`, arrived `67:576`, settings/profile/contact/call frames, watch `131:1296`, and WEB SHARE `127:345`.
- [ ] Store stable source notes and tokens in `docs/figma-main-frames/README.md`.

### Task 2: Replace the domain model test-first

**Files:**
- Replace: `src/journey.ts`
- Replace: `src/journey.test.ts`
- Create: `shared/session.ts`

- [ ] Write failing tests for onboarding, two contacts, destination search/selection, walk start, progress, check-in, panic, alert-sent, arrival, settings, activity feed, and reset.
- [ ] Implement typed session snapshots and pure event reduction with deterministic clock inputs.
- [ ] Run `npm test -- src/journey.test.ts` and expect PASS.

### Task 3: Add the LAN session server

**Files:**
- Create: `server/session-store.ts`
- Create: `server/session-store.test.ts`
- Create: `server/index.ts`
- Create: `server/network.ts`
- Create: `tsconfig.server.json`
- Modify: `package.json`
- Modify: `vite.config.ts`

- [ ] Write store tests for creation, current snapshot, invalid events, subscriber broadcast, and reset.
- [ ] Implement Express routes `GET /api/sessions/:id`, `POST /api/sessions/:id/events`, and WebSocket `/ws/:id`.
- [ ] Install runtime dependencies `express`, `ws`, and `qrcode-terminal`; install development dependencies `tsx`, `concurrently`, `@types/express`, `@types/ws`, and `@types/qrcode-terminal`.
- [ ] Listen on `0.0.0.0`; print localhost and LAN walker/share URLs plus an ASCII QR code for the LAN receiver URL from `server/network.ts`.
- [ ] Proxy `/api` and `/ws` from Vite; add `dev:server` (`tsx watch server/index.ts`), `dev:client`, concurrent `dev`, `typecheck:server` (`tsc -p tsconfig.server.json --noEmit`), and a full `build` that runs both server typecheck and Vite build.
- [ ] Run `npm test -- server/session-store.test.ts`, `npm run typecheck:server`, start `npm run dev:server`, and verify `curl http://127.0.0.1:8787/api/sessions/sarah-j8xk2` returns HTTP 200 JSON.

## Chunk 2: Main Frames Walker UI

### Task 4: Replace the dark visual foundation

**Files:**
- Replace: `src/styles.css`
- Create: `src/components/BeaconUI.tsx`
- Create: `src/components/Map.tsx`
- Create: `src/components/StatusBar.tsx`
- Create: `src/components/PhoneShell.tsx`

- [ ] Encode exact Main Frames warm canvas, mint surfaces/actions, dark-green ink, coral alerts, Nunito type, spacing, radii, and shadows as CSS variables.
- [ ] Build shared controls, cards, inputs, toggles, avatars, status bar, phone shell, and map primitives.
- [ ] Verify visible focus, 44 px touch targets, and reduced motion.

### Task 5: Build onboarding and contacts

**Files:**
- Create: `src/screens/Onboarding.tsx`
- Create: `src/screens/NameSetup.tsx`
- Create: `src/screens/ContactSetup.tsx`
- Create: `src/screens/Onboarding.test.tsx`

- [ ] Implement frames `67:14`, `91:1948`, `91:6240`, and `91:6280` with exact copy and layouts.
- [ ] Validate required name and phone fields and enforce two contacts before Home.
- [ ] Test the complete onboarding transition.

### Task 6: Build destinations and walk setup

**Files:**
- Create: `src/screens/Home.tsx`
- Create: `src/screens/DestinationSearch.tsx`
- Create: `src/screens/WalkSetup.tsx`

- [ ] Implement Home `67:54`, search/result variants `91:4690`, `91:4529`, `91:4451`, `91:4287`, and setup variants `67:133`, `91:4829`, `91:4175`.
- [ ] Support saved/recent places, search results, destination change, safety buffer, and watcher selection.
- [ ] Start the server session and expose Copy Link and QR presentation controls.

### Task 7: Build safety states

**Files:**
- Create: `src/screens/ActiveWalk.tsx`
- Create: `src/screens/CheckIn.tsx`
- Create: `src/screens/Panic.tsx`
- Create: `src/screens/AlertSent.tsx`
- Create: `src/screens/Arrived.tsx`
- Create: `src/screens/SafetyFlow.test.tsx`

- [ ] Implement frames `67:339`, `67:433`, `67:450`, `67:521`, and `67:576`.
- [ ] Publish progress, check-in, panic, alert, and arrival events to the server.
- [ ] Test all transitions, confirmation behavior, and visible safe-demo messaging.

### Task 8: Build settings, contacts, call, and watch

**Files:**
- Create: `src/screens/Settings.tsx`
- Create: `src/screens/Profile.tsx`
- Create: `src/screens/ContactEditor.tsx`
- Create: `src/screens/InAppCall.tsx`
- Create: `src/components/WatchWidget.tsx`

- [ ] Implement `67:805`, `78:256`, `78:582`, `91:1701`, `91:2446`, `91:2610`, `78:931`, `78:792`, and `131:1296`.
- [ ] Persist toggles/profile/contact edits in the session.
- [ ] Simulate calling/connected states and watch presentation without external APIs.

## Chunk 3: Receiver and Two-Phone Verification

### Task 9: Build the shareable receiver route

**Files:**
- Create: `src/share/SharePage.tsx`
- Create: `src/share/useSessionSocket.ts`
- Create: `src/share/SharePage.test.tsx`

- [ ] Implement WEB SHARE node `127:345`: link bar, monitoring header, map, status/ETA, heart-rate card, watch card, and activity list.
- [ ] Fetch initial snapshot and subscribe to `/ws/:id` with reconnect/backoff and last-state retention.
- [ ] Add calm, check-in, panic, arrived, invalid-ID, and reconnecting presentations.

### Task 10: Wire routes and QR/LAN controls

**Files:**
- Replace: `src/App.tsx`
- Replace: `src/App.test.tsx`
- Create: `src/api.ts`
- Create: `src/components/ShareSheet.tsx`

- [ ] Route `/` to walker state and `/share/:id` to the receiver.
- [ ] Generate the share URL from `window.location.host`, copy it, and render its QR code.
- [ ] Provide a presenter-only frame switcher and deterministic time controls without appearing in the product frame.

### Task 11: Verify two-device behavior

**Files:**
- Replace: `e2e/beacon-flow.spec.ts`
- Modify: `playwright.config.ts`
- Replace: `README.md`

- [ ] Start the API and Vite servers in Playwright's webServer configuration.
- [ ] Use two isolated mobile browser contexts: walker and receiver.
- [ ] Verify session load, live progress, check-in, panic/activity, arrival, and reconnect without receiver refresh.
- [ ] Capture 390 px screenshots for every unique Main Frames state and compare against Figma references.
- [ ] Run `npm test`, `npm run test:e2e`, and `npm run build`.
- [ ] Document same-Wi-Fi startup, firewall caveat, phone URLs, QR flow, demo script, and reset recovery.
- [ ] Run the explicit real-device smoke test before delivery: connect two physical phones and the laptop to the same Wi-Fi/hotspot; open the printed walker URL on Phone 1 and scan the terminal QR/direct share URL on Phone 2; verify live check-in, panic, arrival, disconnect/reconnect, and no horizontal clipping without refreshing Phone 2.
