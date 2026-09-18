import type { AgentDecision, BoardSnapshot } from "@/lib/agent/types";
import type { Direction } from "@/lib/snake/types";

const TIE_BREAK: Direction[] = ["UP", "RIGHT", "DOWN", "LEFT"];

const DELTA: Record<Direction, { x: number; y: number }> = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

export function demoPolicy(snapshot: BoardSnapshot): AgentDecision {
  if (snapshot.offered.length === 0) {
    return { operation: "WAIT", source: "demo-policy", latencyMs: 0 };
  }

  const head = snapshot.body[0];
  const ranked = [...snapshot.offered].sort((a, b) => {
    const da = manhattan(
      { x: head.x + DELTA[a.direction].x, y: head.y + DELTA[a.direction].y },
      snapshot.food,
    );
    const db = manhattan(
      { x: head.x + DELTA[b.direction].x, y: head.y + DELTA[b.direction].y },
      snapshot.food,
    );
    if (da !== db) return da - db;
    return TIE_BREAK.indexOf(a.direction) - TIE_BREAK.indexOf(b.direction);
  });

  return {
    operation: "CLICK",
    targetId: ranked[0].id,
    source: "demo-policy",
    latencyMs: 0,
  };
}

function manhattan(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}
