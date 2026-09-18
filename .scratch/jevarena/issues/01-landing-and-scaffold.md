# 01 — Landing and app scaffold

**What to build:** A Spectator can open the site, read a Landing that explains the Match, and enter the Arena (placeholder is fine). The app typechecks and builds. No accounts.

**Blocked by:** None (can start immediately).

**Status:** done

## Acceptance criteria

- [x] `/` is a Landing: short pitch, how the duel works, one control to enter the Arena
- [x] Entering the Arena navigates to a dedicated Arena route (stub content is OK)
- [x] TypeScript Next.js App Router app with `AI_GATEWAY_API_KEY` in `.env.example` only (empty value)
- [x] `typecheck`, lint, and production build succeed
- [x] MIT license; README names JevArena and that Jev is reached through Vercel AI Gateway
- [x] Original code; do not copy the reference repo

## Comments

Landing at `/` with pitch + how the duel works + Enter the Arena → `/arena` stub. Vitest covers that path. `typecheck`, lint, and production build pass. Tickets 02–05 not started.
