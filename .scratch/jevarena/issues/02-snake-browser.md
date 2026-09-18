# 02 — Snake Browser

**What to build:** One isolated Snake Browser page that a Spectator could watch: canvas Snake, indexed on-screen direction buttons, food, Crash, score. The page posts board snapshots to its parent and accepts a Click on a `data-element-id` button. Buttons work without Jev.

**Blocked by:** 01 — Landing and app scaffold

**Status:** done

## Acceptance criteria

- [x] Opening the Snake Browser route shows a live Snake that steps on the Match interval
- [x] Indexed UP/DOWN/LEFT/RIGHT buttons are real DOM targets with stable element ids
- [x] Clicking a safe button changes direction; illegal reverse is not offered as safe
- [x] Eating food increases score and grows the Snake; wall or self hit is a Crash
- [x] Parent window can receive structured board snapshots and send a Click to a target id
- [x] Engine behaviour is covered by tests (move, grow, Crash, independent food seed)

## Comments

`/browser` is the isolated Snake Browser. Engine tests cover move, grow, wall/self Crash, reverse, and food seeds.
