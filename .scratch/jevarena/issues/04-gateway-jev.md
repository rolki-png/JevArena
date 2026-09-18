# 04 — Gateway Jev

**What to build:** When `AI_GATEWAY_API_KEY` is set, both Agents are driven by Jev through Vercel AI Gateway. A Jev failure BLOCKED that Agent and never becomes Demo policy. Live operation and direction probabilities, confidence, and latency show on each pane.

**Blocked by:** 03 — Demo Match

**Status:** ready-for-agent

## Acceptance criteria

- [ ] With a key, Agent-step calls `experimental_evaluate` on `typesafe-ai/jev` (choice: operation and click target)
- [ ] Without a key, behaviour stays Demo policy and labeled
- [ ] Evaluate throw/timeout → BLOCKED for that Agent, Demo policy does not run, UI shows BLOCKED not Crash
- [ ] Returned probabilities, confidence (when present), and latency are visible on the Agent pane
- [ ] Adapter tests use a fake evaluate; CI does not call live Gateway
- [ ] Key is server-only; no TypeSafe SDK
