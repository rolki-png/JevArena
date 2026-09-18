# JevArena

A spectator arena where two independent Jev agents play Snake against each other.

## Language

**JevArena**:
A spectator match in which two Agents play Snake at the same time.
_Avoid_: Jev Arena, jev-arena

**Jev**:
TypeSafe AI's evaluation model. This project reaches it only through Vercel AI Gateway.
_Avoid_: LLM, chat model, TypeSafe SDK

**Agent**:
One Jev player bound to one isolated Snake instance for the duration of a Match.
_Avoid_: bot, model, player (when meaning the Jev side)

**Match**:
A timed duel between two Agents. It lasts 60 seconds unless a Crash ends it sooner.
_Avoid_: game, session, round (when meaning the whole contest)

**Snake**:
The click-only game each Agent plays inside a Match.
_Avoid_: board game, the game (when meaning the Match)

**Spectator**:
A human watching a Match. Spectators do not play.
_Avoid_: user, player (when meaning the human)

**Gateway**:
Vercel AI Gateway, the only path this project uses to call Jev.
_Avoid_: TypeSafe SDK, TYPESAFE_API_KEY

**Browser**:
One isolated iframe browsing context that hosts a single Snake instance and its indexed direction buttons.
_Avoid_: tab, window, Playwright, Chromium

**Click**:
Jev selecting one currently visible safe direction button in that Agent's Browser.
_Avoid_: move, command, generate

**Wait**:
Jev declining to Click this tick; Snake keeps its current direction.
_Avoid_: no-op, skip, pass

**BLOCKED**:
The Agent cannot act. Used when Jev fails or no legal Click exists. Never a silent fallback to the Demo policy.
_Avoid_: error, crashed (when meaning Jev, not Snake)

**Demo policy**:
A labeled deterministic direction picker used only when no Gateway key is configured.
_Avoid_: fallback, mock Jev

**Crash**:
Snake death. That Agent loses the Match immediately.
_Avoid_: death, game over (when meaning the Match result)

**Landing**:
The first screen. It explains the Match; Spectators enter the Arena from here. No accounts.
_Avoid_: homepage, marketing site, waitlist

**Arena**:
The Spectator view of a live Match: two Browsers plus telemetry.
_Avoid_: dashboard, game page, board
