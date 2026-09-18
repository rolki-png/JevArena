import { describe, expect, it, vi } from "vitest";
import { runAgentStep } from "@/lib/agent/jev-adapter";
import type { BoardSnapshot } from "@/lib/agent/types";

const snapshot: BoardSnapshot = {
  width: 13,
  height: 13,
  body: [
    { x: 5, y: 5 },
    { x: 4, y: 5 },
    { x: 3, y: 5 },
  ],
  direction: "RIGHT",
  food: { x: 8, y: 2 },
  score: 0,
  alive: true,
  crashed: false,
  offered: [
    { id: "up", direction: "UP" },
    { id: "down", direction: "DOWN" },
    { id: "right", direction: "RIGHT" },
  ],
};

describe("Jev adapter", () => {
  it("uses Demo policy when no Gateway key is configured", async () => {
    const evaluate = vi.fn();
    const decision = await runAgentStep(snapshot, {
      apiKey: undefined,
      evaluate,
    });
    expect(evaluate).not.toHaveBeenCalled();
    expect(decision.source).toBe("demo-policy");
    expect(decision.operation).toBe("CLICK");
    expect(decision.targetId).toBe("up");
  });

  it("maps a fake evaluate choice onto a Click target", async () => {
    const evaluate = vi.fn(async () => ({
      answers: {
        operation: {
          type: "choice" as const,
          choice: "CLICK",
          probabilities: { CLICK: 0.8, WAIT: 0.15, BLOCKED: 0.05 },
        },
        target: {
          type: "choice" as const,
          choice: "up",
          probabilities: { up: 0.7, down: 0.2, right: 0.1 },
        },
      },
      providerMetadata: {
        typesafe: { confidence: { operation: 0.91, target: 0.64 } },
      },
    }));

    const decision = await runAgentStep(snapshot, {
      apiKey: "test-key",
      evaluate,
    });

    expect(evaluate).toHaveBeenCalledOnce();
    expect(decision.source).toBe("jev");
    expect(decision.operation).toBe("CLICK");
    expect(decision.targetId).toBe("up");
    expect(decision.operationProbabilities?.CLICK).toBe(0.8);
    expect(decision.directionProbabilities?.up).toBe(0.7);
    expect(decision.confidence?.operation).toBe(0.91);
    expect(decision.latencyMs).toBeGreaterThanOrEqual(0);
  });

  it("maps thrown evaluate errors to BLOCKED and does not run Demo policy", async () => {
    const evaluate = vi.fn(async () => {
      throw new Error("gateway down");
    });
    const decision = await runAgentStep(snapshot, {
      apiKey: "test-key",
      evaluate,
    });
    expect(decision.operation).toBe("BLOCKED");
    expect(decision.source).toBe("blocked");
    expect(decision.targetId).toBeUndefined();
  });
});
