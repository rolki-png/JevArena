# 05 — Spectator telemetry

**What to build:** The Arena chrome is detailed: per-tick timeline, event log, stronger Browser chrome, Click flash on board and control. Built on a working Match, not a mock page.

**Blocked by:** 04 — Gateway Jev

**Status:** done

## Acceptance criteria

- [x] Per-tick timeline records each Agent's operation, target, score, and alive/BLOCKED state
- [x] Event log lists Click, Wait, BLOCKED, Crash, and score events for both Agents
- [x] Click flash is visible on the board region and the chosen direction button
- [x] Browser chrome reads as two distinct Agents (name, model source Demo vs Jev, latency)
- [x] Layout remains usable stacked on a narrow viewport
- [x] Landing copy still matches the finished Arena

## Comments

Arena chrome includes timeline, event log, Agent panes (Demo policy vs Jev, latency, probabilities), and Click flash inside each Browser.
