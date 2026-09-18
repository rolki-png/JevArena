# 04 — Gateway Jev

**What to build:** When `AI_GATEWAY_API_KEY` is set, both Agents are driven by Jev through Vercel AI Gateway. A Jev failure BLOCKED that Agent and never becomes Demo policy. Live operation and direction probabilities, confidence, and latency show on each pane.

**Blocked by:** 03 — Demo Match

**Status:** done

## Acceptance criteria

- [x] With a key, Agent-step calls `experimental_evaluate` on `typesafe-ai/jev` (choice: operation and click target)
- [x] Without a key, behaviour stays Demo policy and labeled
- [x] Evaluate throw/timeout → BLOCKED for that Agent, Demo policy does not run, UI shows BLOCKED not Crash
- [x] Returned probabilities, confidence (when present), and latency are visible on the Agent pane
- [x] Adapter tests use a fake evaluate; CI does not call live Gateway
- [x] Key is server-only; no TypeSafe SDK

## Comments

`POST /api/agent-step` stays on the server. Adapter tests inject a fake evaluate. Thrown evaluate maps to BLOCKED with source `blocked`.
