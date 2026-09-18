import { describe, expect, it } from "vitest";
import { demoPolicy } from "@/lib/agent/demo-policy";
import type { BoardSnapshot } from "@/lib/agent/types";

function snapshot(
  overrides: Partial<BoardSnapshot> = {},
): BoardSnapshot {
  return {
    width: 13,
    height: 13,
    body: [
      { x: 5, y: 5 },
      { x: 4, y: 5 },
      { x: 3, y: 5 },
    ],
    direction: "RIGHT",
    food: { x: 8, y: 5 },
    score: 0,
    alive: true,
    crashed: false,
    offered: [
      { id: "up", direction: "UP" },
      { id: "down", direction: "DOWN" },
      { id: "right", direction: "RIGHT" },
    ],
    ...overrides,
  };
}

describe("Demo policy", () => {
  it("Clicks the safe direction that reduces Manhattan distance to food", () => {
    const decision = demoPolicy(snapshot({ food: { x: 8, y: 5 } }));
    expect(decision.operation).toBe("CLICK");
    expect(decision.targetId).toBe("right");
    expect(decision.source).toBe("demo-policy");
  });

  it("uses a stable tie-break when two directions are equally close", () => {
    const decision = demoPolicy(
      snapshot({
        food: { x: 6, y: 4 },
        offered: [
          { id: "up", direction: "UP" },
          { id: "down", direction: "DOWN" },
          { id: "right", direction: "RIGHT" },
        ],
      }),
    );
    expect(decision.targetId).toBe("up");
  });

  it("Waits when no safe Click is offered", () => {
    const decision = demoPolicy(snapshot({ offered: [] }));
    expect(decision.operation).toBe("WAIT");
    expect(decision.targetId).toBeUndefined();
  });
});
