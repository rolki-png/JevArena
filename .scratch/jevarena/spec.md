# JevArena

## Problem Statement

Spectators cannot watch two Jev Agents play Snake against each other through Vercel AI Gateway, in a detailed browser Arena, without using TypeSafe's SDK or a server-side Chromium driver.

## Solution

A public Next.js spectator app: Landing, then Arena. Each Spectator's page runs its own Match. Two isolated iframe Browsers play Snake. Jev may only Click indexed direction buttons or Wait. Jev is called server-side through Vercel AI Gateway. No Gateway key yields a labeled Demo policy. A Jev failure BLOCKED that Agent and never silently falls back.

## User Stories

1. As a Spectator, I want a Landing that explains the Match, so that I understand what I am about to watch before anything moves.
2. As a Spectator, I want a single clear action to enter the Arena, so that I can start watching without creating an account.
3. As a Spectator, I want to see two Browsers side by side, so that I can compare both Agents at a glance.
4. As a Spectator, I want each Browser to be a real isolated page with on-screen direction buttons, so that I can see Jev acting as a browser agent rather than as a hidden game AI.
5. As a Spectator, I want Snake to be the familiar game, so that I do not need a custom rules explanation to follow the Match.
6. As a Spectator, I want a 60-second Match clock, so that I know how long the duel lasts.
7. As a Spectator, I want each Snake to step on a fixed interval, so that the Match feels fair and readable.
8. As a Spectator, I want eating food to score a point and grow that Snake, so that survival and scoring are both visible.
9. As a Spectator, I want the first Crash to end the Match immediately, so that a death is decisive.
10. As a Spectator, I want the higher score to win if both Snakes survive, so that a full-time Match still has a winner.
11. As a Spectator, I want a draw to be possible when scores match and neither Crashes, so that the rules feel honest.
12. As a Spectator, I want each Browser to use an independent food seed, so that the Agents are not playing identical layouts.
13. As a Spectator, I want a rematch control, so that I can start two fresh Browsers without reloading the site.
14. As a Spectator, I want rematch to abort the old loops, so that stale Clicks cannot affect the new Match.
15. As a Spectator, I want to see each Agent's score live, so that I can track who is ahead.
16. As a Spectator, I want a Crash and win banner, so that the result is obvious when the Match ends.
17. As a Spectator, I want to see a Click flash on the board and the button Jev chose, so that I can see who acted.
18. As a Spectator, I want live operation probabilities (Click, Wait, BLOCKED), so that I can see Jev's decision mix.
19. As a Spectator, I want live direction probabilities for the offered buttons, so that I can see which way Jev is leaning.
20. As a Spectator, I want confidence for the chosen operation and Click target, so that I can judge how sure Jev was.
21. As a Spectator, I want latency for each step, so that I can see how long Jev took.
22. As a Spectator, I want a per-tick timeline, so that I can scrub what happened during the Match.
23. As a Spectator, I want an event log (Click, Wait, BLOCKED, Crash, score), so that I can read the Match as a sequence.
24. As a Spectator, I want BLOCKED to be visually distinct from Crash, so that I do not confuse a Jev failure with Snake death.
25. As a Spectator, I want a labeled Demo policy when no Gateway key is configured, so that I can still watch a Match and know it is not Jev.
26. As a Spectator, I want a configured Jev failure to BLOCKED that Agent without switching to the Demo policy, so that I never mistake a fallback for Jev.
27. As a Spectator, I want both Agents to keep playing independently if only one is BLOCKED, so that the other Agent can still Crash or score.
28. As a Spectator, I want Wait to keep the current direction, so that Jev can decline to Click without stopping Snake.
29. As a Spectator, I want Jev to be offered only legal/safe on-screen buttons, so that a Click cannot reverse into the body or leave the board if the UI already forbids it.
30. As a Spectator, I want the Arena to work on a laptop browser without extra installs, so that the demo is one URL.
31. As a Spectator on a narrower screen, I want the two Browsers to stack readably, so that I can still follow the Match.
32. As a developer, I want `AI_GATEWAY_API_KEY` to be the only credential, so that I do not wire TypeSafe's SDK.
33. As a developer, I want that key never to ship to the browser, so that Spectators cannot steal it.
34. As a developer, I want a `.env.example` without secrets, so that clones know what to set.
35. As a developer, I want the app to typecheck, lint, and build, so that I can ship with confidence.
36. As a maintainer, I want original code (not a fork of the reference repo), so that this project has a clean license and history.
37. As a maintainer, I want MIT licensing, so that the repo is simple to reuse.
38. As a maintainer, I want the public GitHub repo to contain the app, so that others can clone JevArena.
39. As a future driver author, I want the Jev request contract to stay stable if Playwright replaces iframes, so that the adapter does not churn.
40. As a Spectator, I want no accounts, sign-in, or waitlist, so that watching stays one click from the Landing.

## Implementation Decisions

- Next.js App Router, TypeScript, React. Framework choice is closed.
- Jev is called only through Vercel AI Gateway using the AI SDK `experimental_evaluate` API and model id `typesafe-ai/jev` (or `typesafe-ai/jev-latest` if that is the Gateway id that resolves). Do not add `@typesafe-ai/sdk`. Do not use `TYPESAFE_API_KEY`.
- Evaluate two `choice` questions per step against one shared state: **operation** (`CLICK`, `WAIT`, `BLOCKED`) and **click target** (offered element ids). Read selected choice, optional probabilities, latency, and TypeSafe confidence from provider metadata when present.
- Agent step is a server-only route. The browser sends a board snapshot plus offered elements; the server returns an operation and optional target id.
- Each Agent's Snake lives in a same-origin iframe Browser. The iframe posts structured snapshots to the parent; the parent asks the server; the parent tells that iframe to Click a `data-element-id` button. No Playwright and no Chromium in production (ADR-0002).
- Demo policy runs only when `AI_GATEWAY_API_KEY` is unset. It is labeled in the UI. It picks a safe direction that reduces Manhattan distance to food, with a stable tie-break. Jev errors and timeouts are BLOCKED, never Demo policy.
- Match rules: 60 seconds; Snake advances every 230 ms; Jev may Click UP/DOWN/LEFT/RIGHT or Wait; food is +1 and grow; first Crash loses; else higher score wins; equal scores and no Crash is a draw; independent food seeds; rematch aborts both loops and opens fresh Browsers.
- Each Spectator's page runs its own Match. There is no shared live broadcast.
- Landing is `/`. Arena is a separate route entered from Landing. No accounts.
- Primary test seam is the **Match orchestrator**: injected clock, two Agent policies, two Snake instances. Assert scores, Crash, BLOCKED, winner, and that Demo policy never runs after a Jev failure.
- Snake engine is a pure deterministic simulation used by the Browser and tested through the Match seam plus focused engine cases for wrap/crash/grow.
- Jev adapter is tested with the AI SDK evaluation mock (or an equivalent fake) so Gateway is not required in CI.
- Vercel-ready: `AI_GATEWAY_API_KEY` from the environment. MIT license. Public repo `rolki-png/JevArena`.
- UI floor: two Browser panes, live operation and direction probabilities, Match clock, scores, Crash/win banner, Click flash, rematch. UI extras: per-tick timeline, confidence, latency, event log, stronger chrome.
- Domain words come from `CONTEXT.md`. Do not say LLM, bot, TypeSafe SDK, or fallback when meaning Demo policy.

## Testing Decisions

- Test external behaviour at the Match seam: given policies and time, the Match produces the documented outcome and telemetry. Do not assert React internals, CSS, or iframe implementation details.
- Snake cases that are awkward through the Match (growth, self-Crash, wall Crash, illegal reverse) are tested on the engine as observable board states.
- The Jev adapter is tested with a fake/mock evaluate: maps a fixture state to a known choice, maps thrown errors to BLOCKED, maps missing key to Demo policy.
- A good test is one a Spectator could narrate ("Agent A Crashes, Agent B wins") or a developer could narrate ("no key, labeled demo Click"). A bad test snapshots component trees or private helpers.
- CI runs typecheck, lint, unit tests, and production build. No live Gateway calls in CI.

## Out of Scope

- Playwright / server-side browser workers
- TypeSafe SDK and `TYPESAFE_API_KEY`
- Shared broadcast Matches, accounts, waitlists, payments
- Games other than Snake
- Training, fine-tuning, or exposing Jev to the browser
- Changing Match timing/rules in this spec

## Further Notes

- Inspired by https://github.com/raihankhan-rk/jevarena; this repo is an original implementation.
- Gateway key is a secret: gitignored local env and GitHub Actions secret. Never commit it.
- ADRs: 0001 Vercel AI Gateway; 0002 iframe click-only driver.
