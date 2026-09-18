# 03 — Demo Match

**What to build:** The Arena runs a full Match with two independent Browsers driven by the labeled Demo policy: clock, scores, first Crash loses, else higher score wins, rematch. No Gateway key required. This is the first demoable duel.

**Blocked by:** 02 — Snake Browser

**Status:** done

## Acceptance criteria

- [x] Arena shows two Browsers, Match clock, live scores, Crash/win (or draw) banner, rematch
- [x] Each Browser is its own iframe Snake instance with an independent food seed
- [x] Server Agent-step uses Demo policy when no Gateway key is set, and the UI labels it as Demo policy
- [x] Demo policy only Clicks offered safe buttons (or Waits); Match rules match the spec
- [x] Rematch aborts both old loops and opens fresh Browsers
- [x] Match orchestrator tests cover Crash win, score win, draw, and rematch isolation

## Comments

Arena mounts two `/browser` iframes. Empty `AI_GATEWAY_API_KEY` runs the labeled Demo policy. Orchestrator tests cover Crash, score, draw, rematch abort, and BLOCKED vs Demo policy.
