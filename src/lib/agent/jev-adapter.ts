import { experimental_evaluate as evaluateGateway } from "ai";
import { demoPolicy } from "@/lib/agent/demo-policy";
import type { AgentDecision, BoardSnapshot, Operation } from "@/lib/agent/types";

const MODEL_ID = "typesafe-ai/jev";
const EVALUATE_TIMEOUT_MS = 2000;

export type EvaluateResult = {
  answers: {
    operation?: {
      type: "choice";
      choice: string;
      probabilities?: Record<string, number>;
    };
    target?: {
      type: "choice";
      choice: string;
      probabilities?: Record<string, number>;
    };
  };
  providerMetadata?: {
    typesafe?: {
      confidence?: Record<string, number>;
    };
  };
};

export type EvaluateFn = (input: {
  model: string;
  state: unknown;
  questions: Record<string, unknown>;
}) => Promise<EvaluateResult>;

export async function runAgentStep(
  snapshot: BoardSnapshot,
  options: {
    apiKey?: string | null;
    evaluate?: EvaluateFn;
    timeoutMs?: number;
  } = {},
): Promise<AgentDecision> {
  if (!options.apiKey) {
    return demoPolicy(snapshot);
  }

  const evaluate = options.evaluate ?? (evaluateGateway as EvaluateFn);
  const started = Date.now();

  try {
    const result = await withTimeout(
      evaluate({
        model: MODEL_ID,
        state: {
          width: snapshot.width,
          height: snapshot.height,
          body: snapshot.body,
          direction: snapshot.direction,
          food: snapshot.food,
          score: snapshot.score,
          alive: snapshot.alive,
          offered: snapshot.offered.map((el) => el.id),
        },
        questions: buildQuestions(snapshot),
      }),
      options.timeoutMs ?? EVALUATE_TIMEOUT_MS,
    );

    const latencyMs = Date.now() - started;
    return decisionFromEvaluate(snapshot, result, latencyMs);
  } catch {
    return {
      operation: "BLOCKED",
      source: "blocked",
      latencyMs: Date.now() - started,
    };
  }
}

function buildQuestions(snapshot: BoardSnapshot) {
  const operation = {
    type: "choice" as const,
    instructions:
      "Choose how this Agent acts now. CLICK a currently offered safe direction button, WAIT to keep the current direction, or BLOCKED if the Agent cannot act.",
    criteria: {
      CLICK: "Select one offered direction button.",
      WAIT: "Keep the current direction; do not Click.",
      BLOCKED: "The Agent cannot act.",
    },
  };

  if (snapshot.offered.length === 0) {
    return { operation };
  }

  const criteria: Record<string, string> = {};
  for (const el of snapshot.offered) {
    criteria[el.id] = `Click the ${el.direction} button.`;
  }

  return {
    operation,
    target: {
      type: "choice" as const,
      instructions:
        "If the operation is CLICK, pick one offered button id. Ignore this when Waiting.",
      criteria,
    },
  };
}

function decisionFromEvaluate(
  snapshot: BoardSnapshot,
  result: EvaluateResult,
  latencyMs: number,
): AgentDecision {
  const operation = (result.answers.operation?.choice ?? "BLOCKED") as Operation;
  const validOperation: Operation =
    operation === "CLICK" || operation === "WAIT" || operation === "BLOCKED"
      ? operation
      : "BLOCKED";
  const targetId = result.answers.target?.choice;
  const offeredIds = new Set<string>(snapshot.offered.map((el) => el.id));
  const confidence = result.providerMetadata?.typesafe?.confidence;

  if (validOperation === "CLICK") {
    if (!targetId || !offeredIds.has(targetId)) {
      return {
        operation: "BLOCKED",
        source: "blocked",
        operationProbabilities: result.answers.operation?.probabilities,
        directionProbabilities: result.answers.target?.probabilities,
        confidence: {
          operation: confidence?.operation,
          target: confidence?.target,
        },
        latencyMs,
      };
    }
    return {
      operation: "CLICK",
      targetId,
      source: "jev",
      operationProbabilities: result.answers.operation?.probabilities,
      directionProbabilities: result.answers.target?.probabilities,
      confidence: {
        operation: confidence?.operation,
        target: confidence?.target,
      },
      latencyMs,
    };
  }

  if (validOperation === "WAIT") {
    return {
      operation: "WAIT",
      source: "jev",
      operationProbabilities: result.answers.operation?.probabilities,
      directionProbabilities: result.answers.target?.probabilities,
      confidence: {
        operation: confidence?.operation,
        target: confidence?.target,
      },
      latencyMs,
    };
  }

  return {
    operation: "BLOCKED",
    source: "blocked",
    operationProbabilities: result.answers.operation?.probabilities,
    directionProbabilities: result.answers.target?.probabilities,
    confidence: {
      operation: confidence?.operation,
      target: confidence?.target,
    },
    latencyMs,
  };
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("evaluate timeout")), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}
