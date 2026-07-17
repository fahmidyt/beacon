# Beacon Demo Design

## Goal

Build a safe, interactive frontend demo of Beacon's primary personal-safety journey. The demo must feel complete during a hackathon presentation while using only simulated contacts, location, alerts, and calls.

## Scope

The primary flow is:

1. Welcome and lightweight profile setup.
2. Add a trusted contact, prefilled as “Mom” for a fast demo.
3. Choose a recent destination from Home.
4. Review a simulated route, ETA, and recipient before starting.
5. Follow an automatically progressing active walk.
6. Respond to a timed check-in or trigger the panic flow.
7. Show the trusted contact's monitoring view and alert state.
8. Mark the walker as arrived and show a completion summary.

Settings, real authentication, databases, GPS, SMS, phone calls, push notifications, and background tracking are outside this demo's scope.

## Architecture

The app is a mobile-first React, TypeScript, and Vite web application in its own `beacon-demo` repository. React Router controls screen navigation. A focused journey state module owns profile, contact, destination, timer, progress, check-in, panic, and arrival transitions. State is persisted to `localStorage` so a refresh does not interrupt the presentation, and a reset action restores the known initial state.

External behavior is represented by a simulation service. It advances route progress and countdown time deterministically, exposes check-in deadlines, and switches the contact monitor into alert mode after a panic action. The interface labels simulated behavior clearly and never requests or transmits real personal or location data.

## Interface Structure

- `PhoneShell` provides the 390 px Figma canvas, status bar, safe areas, and responsive desktop framing.
- `WelcomeScreen` introduces Beacon and starts setup.
- `ProfileScreen` captures a display name with a demo default.
- `ContactScreen` captures and validates a trusted contact without sending messages.
- `HomeScreen` offers recent destinations and starts the primary journey.
- `WalkSetupScreen` reviews destination, route, ETA, and contact.
- `ActiveWalkScreen` combines the simulated map, progress, timer, check-in, panic, and arrival actions.
- `ContactMonitorScreen` shows the contact-facing status and changes presentation when an alert is raised.
- `ArrivalScreen` summarizes completion and supports demo reset.
- Shared UI includes the Beacon mark, buttons, destination cards, contact cards, simulated map, status chips, check-in dialog, and panic confirmation.

## Data Flow

Form actions update the journey store, then route to the next valid screen. Starting a walk creates a deterministic ten-minute journey with a fixed route and separate journey and safety clocks. Route progress and ETA derive from an injectable clock. A safety check-in becomes due at minute six and expires after sixty seconds. Acknowledgement clears that prompt and schedules no additional prompt within this short demo. Expiry changes the shared status to `missed-check-in`, which appears as a warning in both walker and contact views; it never contacts a real service. Panic changes the shared status to `panic`, which appears as an urgent alert. Arrival stops both clocks and records a completed state.

During an active journey, a labeled `Contact view` presenter control opens the monitor in the same browser. A matching `Back to walker` control returns without changing state, so the presenter can demonstrate the monitor and still finish the journey. These controls are explicitly demo-only and visually secondary to the product actions.

The simulation receives a `Clock` interface whose production implementation uses `Date.now()` and whose tests use a manually advanced fake clock. This keeps state derivation deterministic and browser tests fast.

Routes guard against invalid direct navigation. Missing prerequisites redirect to the earliest required screen. Persisted data is parsed and validated; corrupted or incompatible data falls back to defaults.

## Visual Direction

The implementation follows the supplied Beacon Figma file: a calm off-white and soft-green palette, rounded surfaces, restrained shadows, a strong circular start-walk control, and red reserved for urgent states. Typography, spacing, component radii, and icon proportions are extracted from the exact Figma frames before implementation. The phone canvas remains faithful at 390 px and adapts safely to narrow phones and desktop presentation screens.

## Error Handling and Safety

- Required profile and contact fields show inline validation.
- Invalid route access returns the presenter to the correct prerequisite.
- Corrupt saved state is discarded without crashing.
- Timer expiry opens a simulated missed-check-in state rather than contacting anyone.
- Panic requires confirmation to prevent accidental activation.
- Every external action is visibly marked as a demo simulation.
- A persistent reset control makes recovery during a live presentation immediate.

## Testing

Unit tests cover the journey state transitions, persistence fallback, timer/check-in behavior, panic, and arrival. Component tests cover required-field validation and safety confirmation. One browser-level smoke flow verifies onboarding through arrival, plus the panic-to-monitor branch. Production build and responsive visual checks validate the final repository.

## Success Criteria

- The primary flow is fully clickable and survives refresh.
- Timer, progress, check-in, panic, contact monitor, and arrival states behave coherently.
- No action sends real data or invokes a real external service.
- The interface closely matches the relevant Figma frames at mobile size.
- Automated tests and the production build pass.
