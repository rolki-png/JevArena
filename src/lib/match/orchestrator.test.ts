import { describe, expect, it } from "vitest";
import { createMatch, tickMatch } from "@/lib/match/orchestrator";
import { demoPolicy } from "@/lib/agent/demo-policy";
import { createSnake } from "@/lib/snake/engine";
import { BOARD_SIZE, STEP_MS } from "@/lib/snake/constants";
import type { AgentDecision, BoardSnapshot } from "@/lib/agent/types";

const waitPolicy = (): AgentDecision => ({
  operation: "WAIT",
  source: "demo-policy",
});

const clickRight = (): AgentDecision => ({
  operation: "CLICK",
  targetId: "right",
  source: "demo-policy",
});

describe("Match orchestrator", () => {
  it("Agent A Crashes and Agent B wins", async () => {
    const match = createMatch({
      snakeA: createSnake({
        seed: 1,
        start: { x: BOARD_SIZE - 1, y: 6 },
        direction: "RIGHT",
        food: { x: 1, y: 1 },
      }),
      snakeB: createSnake({
        seed: 2,
        start: { x: 4, y: 6 },
        direction: "RIGHT",
        food: { x: 1, y: 1 },
      }),
      policyA: waitPolicy,
      policyB: waitPolicy,
      matchMs: 10_000,
    });

    await tickMatch(match);

    expect(match.snakeA.crashed).toBe(true);
    expect(match.result?.winner).toBe("b");
    expect(match.result?.reason).toBe("crash");
    expect(match.ended).toBe(true);
  });

  it("higher score wins when both Snakes survive", async () => {
    const match = createMatch({
      snakeA: createSnake({
        seed: 3,
        start: { x: 3, y: 6 },
        direction: "RIGHT",
        food: { x: 4, y: 6 },
      }),
      snakeB: createSnake({
        seed: 4,
        start: { x: 3, y: 8 },
        direction: "RIGHT",
        food: { x: 1, y: 1 },
      }),
      policyA: clickRight,
      policyB: waitPolicy,
      matchMs: STEP_MS,
    });

    await tickMatch(match);
    expect(match.snakeA.score).toBe(1);
    expect(match.snakeB.score).toBe(0);
    expect(match.snakeA.crashed).toBe(false);
    expect(match.snakeB.crashed).toBe(false);
    expect(match.result?.winner).toBe("a");
    expect(match.result?.reason).toBe("score");
  });

  it("is a draw when scores match and neither Crashes", async () => {
    const match = createMatch({
      snakeA: createSnake({
        seed: 5,
        start: { x: 3, y: 4 },
        direction: "RIGHT",
        food: { x: 1, y: 1 },
      }),
      snakeB: createSnake({
        seed: 6,
        start: { x: 3, y: 8 },
        direction: "RIGHT",
        food: { x: 1, y: 11 },
      }),
      policyA: waitPolicy,
      policyB: waitPolicy,
      matchMs: STEP_MS,
    });

    await tickMatch(match);
    expect(match.result?.winner).toBe("draw");
    expect(match.result?.reason).toBe("draw");
  });

  it("rematch isolation: aborting the old Match ignores later ticks", async () => {
    const match = createMatch({
      snakeA: createSnake({ seed: 8 }),
      snakeB: createSnake({ seed: 9 }),
      policyA: demoPolicy,
      policyB: demoPolicy,
      matchMs: 10_000,
    });

    await tickMatch(match);
    const ticksAfterFirst = match.ticks;
    const scoreA = match.snakeA.score;
    match.abort();
    await tickMatch(match);
    expect(match.ticks).toBe(ticksAfterFirst);
    expect(match.snakeA.score).toBe(scoreA);
    expect(match.aborted).toBe(true);

    const rematch = createMatch({
      snakeA: createSnake({ seed: 100 }),
      snakeB: createSnake({ seed: 200 }),
      policyA: demoPolicy,
      policyB: demoPolicy,
      matchMs: STEP_MS,
    });
    expect(rematch.snakeA.seed).not.toBe(match.snakeA.seed);
    expect(rematch.ticks).toBe(0);
  });

  it("never runs Demo policy after a Jev failure — BLOCKED instead", async () => {
    let demoCalls = 0;
    const blockedJev = (): AgentDecision => ({
      operation: "BLOCKED",
      source: "blocked",
    });
    const countingDemo = (snapshot: BoardSnapshot): AgentDecision => {
      demoCalls += 1;
      return demoPolicy(snapshot);
    };

    const match = createMatch({
      snakeA: createSnake({
        seed: 12,
        start: { x: 3, y: 6 },
        direction: "RIGHT",
        food: { x: 1, y: 1 },
      }),
      snakeB: createSnake({
        seed: 13,
        start: { x: 3, y: 8 },
        direction: "RIGHT",
        food: { x: 1, y: 1 },
      }),
      policyA: blockedJev,
      policyB: countingDemo,
      matchMs: STEP_MS,
    });

    await tickMatch(match);
    const aEvents = match.timeline.filter((entry) => entry.agent === "a");
    expect(aEvents.every((entry) => entry.operation === "BLOCKED")).toBe(true);
    expect(aEvents.every((entry) => entry.source === "blocked")).toBe(true);
    expect(match.snakeA.crashed).toBe(false);
    expect(demoCalls).toBeGreaterThan(0);
  });
});
