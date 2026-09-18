# 05 — Spectator telemetry

**What to build:** The Arena chrome is detailed: per-tick timeline, event log, stronger Browser chrome, Click flash on board and control. Built on a working Match, not a mock page.

**Blocked by:** 04 — Gateway Jev

**Status:** ready-for-agent

## Acceptance criteria

- [ ] Per-tick timeline records each Agent's operation, target, score, and alive/BLOCKED state
- [ ] Event log lists Click, Wait, BLOCKED, Crash, and score events for both Agents
- [ ] Click flash is visible on the board region and the chosen direction button
- [ ] Browser chrome reads as two distinct Agents (name, model source Demo vs Jev, latency)
- [ ] Layout remains usable stacked on a narrow viewport
- [ ] Landing copy still matches the finished Arena
