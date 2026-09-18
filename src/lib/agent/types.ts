import type { Direction, OfferedElement, Cell } from "@/lib/snake/types";

export type DecisionSource = "jev" | "demo-policy" | "blocked";

export type Operation = "CLICK" | "WAIT" | "BLOCKED";

export type BoardSnapshot = {
  width: number;
  height: number;
  body: Cell[];
  direction: Direction;
  food: Cell;
  score: number;
  alive: boolean;
  crashed: boolean;
  offered: OfferedElement[];
};

export type AgentDecision = {
  operation: Operation;
  targetId?: string;
  source: DecisionSource;
  operationProbabilities?: Partial<Record<Operation, number>>;
  directionProbabilities?: Partial<Record<string, number>>;
  confidence?: Partial<Record<"operation" | "target", number>>;
  latencyMs?: number;
};

export type AgentPolicy = (
  snapshot: BoardSnapshot,
) => AgentDecision | Promise<AgentDecision>;
