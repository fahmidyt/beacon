# Beacon Main Frames Two-Device Demo Design

## Correction and Source of Truth

This design supersedes the earlier Beacon demo spec. The implementation source of truth is the Figma section `Main frames` (`96:2`) in file `GM6dXPtz6paHOvvQK8spGD`. Documentation mockups outside this section are not implementation targets.

## Goal

Build a safe hackathon demo that runs on two physical phones on the same Wi-Fi or hotspot. Phone 1 is the walker application. Phone 2 opens a shareable monitoring link and receives journey changes in real time.

## Main Frames Scope

Implement the unique states represented by the direct children of `Main frames`:

- Beacon onboarding, name setup, and two-contact setup.
- Home and recent destinations.
- Destination search, saved places, results, and destination selection.
- Walk setup with destination, ETA, safety buffer, and watchers.
- Active sharing, scheduled check-in, panic progress, alert-sent state, and arrived state.
- Settings, profile, add contact, edit contact, and contact notification preferences.
- In-app call calling and connected states.
- Smartwatch widget presentation.
- Public web-share monitoring screen (`WEB SHARE`, node `127:345`).

Repeated variants that only change sample data reuse one component and data model. No unique product state shown in Main Frames is omitted.

## Two-Device Architecture

The repository contains a React and TypeScript client plus a lightweight Node, Express, and WebSocket server. The server owns in-memory demo sessions. A session has a short share ID, walker data, destination, journey timing, safety status, simulated heart rate/watch data, and an append-only activity feed.

Phone 1 creates or restores session `sarah-j8xk2` and publishes user actions to the server. Phone 2 opens `/share/sarah-j8xk2`, fetches the current snapshot, then subscribes to WebSocket updates. The server broadcasts every accepted change to all subscribers of the same session. The UI displays reconnecting/offline state while retaining the last snapshot.

The Vite development server proxies `/api` and `/ws` to the Node server. Both servers listen on all interfaces. A startup helper prints the laptop's LAN URLs and a QR code for the receiver link so both phones can connect through the shared network.

## Application Flow

The walker flow starts with onboarding, profile name, first contact, second contact, and Home. The presenter selects or searches for a destination, reviews walk settings, and starts sharing. Active sharing emits deterministic simulated progress, ETA, heart rate, watch battery, and activity entries. Check-in acknowledgement, missed check-in, panic, and arrival update both phones immediately.

The receiver page matches the WEB SHARE frame: browser-link treatment, monitoring header, live badge, route map, on-track/ETA card, heart-rate and watch cards, and timestamped activity timeline. Panic replaces calm status with an urgent alert treatment; arrival switches the shared session to completed.

Settings and contact-management screens remain reachable from the walker app and persist through the same demo session. In-app call states and smartwatch widget are accessible from their relevant actions without making a real call or reading a real watch.

## Visual System

The UI follows Main Frames rather than the earlier dark documentation mockups. It uses the warm off-white canvas, desaturated mint-green actions and map surfaces, rounded cream cards, compact dark-green typography, coral/red only for alerts, and Nunito typography shown in Figma. Layouts are implemented at the 390 px frame width and adapt to common mobile viewports without clipped primary actions.

## Safety and Error Handling

- No real GPS, heart rate, smartwatch, SMS, phone, push notification, or emergency service is used.
- Every generated measurement is labeled as demo/simulated where appropriate.
- Invalid or expired share IDs show a friendly receiver error.
- Disconnected clients show reconnecting state and preserve the last known snapshot.
- The server validates message types and ignores malformed payloads.
- Reset restores a deterministic session for fast presentation recovery.
- Share URLs use local-network addresses only and contain no personal data.

## Testing

- Reducer tests cover onboarding, destinations, active sharing, check-in, panic, alert sent, arrival, settings, and reset.
- Server tests cover session creation, validation, snapshots, broadcasts, and reconnection.
- Component tests cover required fields, dialogs, and contact preferences.
- Playwright uses two isolated browser contexts to simulate the two physical phones and verifies real-time check-in, panic, activity, and arrival sync.
- Visual tests capture walker and receiver states at 390 px and compare them against exact Main Frames screenshots.
- A manual LAN smoke test opens the printed URL on two physical phones before delivery.

## Success Criteria

- Both phones can open the demo through a shared Wi-Fi/hotspot without cloud deployment.
- The receiver link opens directly and receives walker changes without refresh.
- All unique Main Frames product states are implemented and navigable.
- The walker and WEB SHARE surfaces closely match their exact Figma frames.
- Disconnection, reconnection, invalid links, and reset do not crash the demo.
- Unit, server, two-context E2E, and production builds pass.
