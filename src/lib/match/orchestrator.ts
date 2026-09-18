import { applyClick, offeredElements, step } from "@/lib/snake/engine";
import { ID_TO_DIRECTION, STEP_MS } from "@/lib/snake/constants";
import type { SnakeState } from "@/lib/snake/types";
import type {
  AgentDecision,
  AgentPolicy,
  BoardSnapshot,
  Operation,
} from "@/lib/agent/types";

export type AgentId = "a" | "b";

export type MatchResult = {
  winner: "a" | "b" | "draw";
  reason: "crash" | "score" | "draw";
};

export type TickEntry = {
  tick: number;
  agent: AgentId;
  operation: Operation;
  targetId?: string;
  score: number;
  alive: boolean;
  blocked: boolean;
  crashed: boolean;
  source: AgentDecision["source"];
  operationProbabilities?: AgentDecision["operationProbabilities"];
  directionProbabilities?: AgentDecision["directionProbabilities"];
  confidence?: AgentDecision["confidence"];
  latencyMs?: number;
};

export type MatchEvent = {
  tick: number;
  agent: AgentId;
  kind: "Click" | "Wait" | "BLOCKED" | "Crash" | "score";
  detail: string;
};

export type Match = {
  snakeA: SnakeState;
  snakeB: SnakeState;
  policyA: AgentPolicy;
  policyB: AgentPolicy;
  stepMs: number;
  matchMs: number;
  elapsedMs: number;
  ticks: number;
  ended: boolean;
  aborted: boolean;
  result: MatchResult | null;
  timeline: TickEntry[];
  events: MatchEvent[];
  lastDecision: Record<AgentId, AgentDecision | null>;
  generation: number;
  abort: () => void;
};

export function createMatch(options: {
  snakeA: SnakeState;
  snakeB: SnakeState;
  policyA: AgentPolicy;
  policyB: AgentPolicy;
  stepMs?: number;
  matchMs?: number;
}): Match {
  const match: Match = {
    snakeA: options.snakeA,
    snakeB: options.snakeB,
    policyA: options.policyA,
    policyB: options.policyB,
    stepMs: options.stepMs ?? STEP_MS,
    matchMs: options.matchMs ?? 60_000,
    elapsedMs: 0,
    ticks: 0,
    ended: false,
    aborted: false,
    result: null,
    timeline: [],
    events: [],
    lastDecision: { a: null, b: null },
    generation: 1,
    abort: () => {
      match.aborted = true;
      match.ended = true;
    },
  };
  return match;
}

export async function tickMatch(match: Match): Promise<void> {
  while (!match.ended && !match.aborted) {
    await stepOnce(match);
  }
}

export async function stepOnce(match: Match): Promise<void> {
  if (match.ended || match.aborted) return;

  const snapA = toSnapshot(match.snakeA);
  const snapB = toSnapshot(match.snakeB);
  const [decisionA, decisionB] = await Promise.all([
    decide(match.policyA, snapA),
    decide(match.policyB, snapB),
  ]);

  if (match.aborted) return;

  const beforeA = match.snakeA.score;
  const beforeB = match.snakeB.score;
  match.lastDecision = { a: decisionA, b: decisionB };
  match.snakeA = applyDecision(match.snakeA, decisionA);
  match.snakeB = applyDecision(match.snakeB, decisionB);
  match.snakeA = step(match.snakeA);
  match.snakeB = step(match.snakeB);
  match.ticks += 1;
  match.elapsedMs += match.stepMs;

  record(match, "a", decisionA, match.snakeA, beforeA);
  record(match, "b", decisionB, match.snakeB, beforeB);

  if (match.snakeA.crashed || match.snakeB.crashed) {
    finishCrash(match);
    return;
  }

  if (match.elapsedMs >= match.matchMs) {
    finishTime(match);
  }
}

export function toSnapshot(state: SnakeState): BoardSnapshot {
  return {
    width: state.width,
    height: state.height,
    body: state.body,
    direction: state.direction,
    food: state.food,
    score: state.score,
    alive: state.alive,
    crashed: state.crashed,
    offered: offeredElements(state),
  };
}

async function decide(
  policy: AgentPolicy,
  snapshot: BoardSnapshot,
): Promise<AgentDecision> {
  return policy(snapshot);
}

function applyDecision(state: SnakeState, decision: AgentDecision): SnakeState {
  if (decision.operation !== "CLICK" || !decision.targetId) return state;
  const direction =
    ID_TO_DIRECTION[decision.targetId as keyof typeof ID_TO_DIRECTION];
  if (!direction) return state;
  const offered = offeredElements(state);
  if (!offered.some((el) => el.id === decision.targetId)) return state;
  return applyClick(state, direction);
}

function record(
  match: Match,
  agent: AgentId,
  decision: AgentDecision,
  snake: SnakeState,
  previousScore: number,
) {
  const blocked = decision.operation === "BLOCKED";
  match.timeline.push({
    tick: match.ticks,
    agent,
    operation: decision.operation,
    targetId: decision.targetId,
    score: snake.score,
    alive: snake.alive,
    blocked,
    crashed: snake.crashed,
    source: decision.source,
    operationProbabilities: decision.operationProbabilities,
    directionProbabilities: decision.directionProbabilities,
    confidence: decision.confidence,
    latencyMs: decision.latencyMs,
  });

  if (decision.operation === "CLICK") {
    match.events.push({
      tick: match.ticks,
      agent,
      kind: "Click",
      detail: `Click ${decision.targetId ?? "none"}`,
    });
  } else if (decision.operation === "WAIT") {
    match.events.push({
      tick: match.ticks,
      agent,
      kind: "Wait",
      detail: "Wait",
    });
  } else {
    match.events.push({
      tick: match.ticks,
      agent,
      kind: "BLOCKED",
      detail: "BLOCKED",
    });
  }

  if (snake.score > previousScore) {
    match.events.push({
      tick: match.ticks,
      agent,
      kind: "score",
      detail: `score ${snake.score}`,
    });
  }
  if (snake.crashed) {
    match.events.push({
      tick: match.ticks,
      agent,
      kind: "Crash",
      detail: "Crash",
    });
  }
}

function finishCrash(match: Match) {
  match.ended = true;
  const a = match.snakeA.crashed;
  const b = match.snakeB.crashed;
  if (a && !b) {
    match.result = { winner: "b", reason: "crash" };
  } else if (b && !a) {
    match.result = { winner: "a", reason: "crash" };
  } else {
    match.result = { winner: "draw", reason: "crash" };
  }
}

function finishTime(match: Match) {
  match.ended = true;
  if (match.snakeA.score > match.snakeB.score) {
    match.result = { winner: "a", reason: "score" };
  } else if (match.snakeB.score > match.snakeA.score) {
    match.result = { winner: "b", reason: "score" };
  } else {
    match.result = { winner: "draw", reason: "draw" };
  }
}
