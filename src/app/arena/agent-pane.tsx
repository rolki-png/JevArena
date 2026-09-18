"use client";

import type { AgentDecision } from "@/lib/agent/types";
import type { AgentId } from "@/lib/match/orchestrator";
import { cn } from "@/lib/utils";

export function AgentPane({
  agent,
  accent,
  seed,
  generation,
  score,
  source,
  decision,
  blocked,
  crashed,
  iframeRef,
}: {
  agent: AgentId;
  accent: "lime" | "amber";
  seed: number;
  generation: number;
  score: number;
  source: string;
  decision: AgentDecision | null;
  blocked: boolean;
  crashed: boolean;
  iframeRef: (node: HTMLIFrameElement | null) => void;
}) {
  const src = `/browser?agent=${agent}&seed=${seed}&accent=${accent}&generation=${generation}`;
  const ops = decision?.operationProbabilities;
  const dirs = decision?.directionProbabilities;

  return (
    <article
      className={cn(
        "flex flex-col overflow-hidden rounded-2xl border bg-card/70",
        accent === "lime" ? "border-primary/35" : "border-chart-2/50",
        blocked && !crashed && "ring-2 ring-destructive/70",
        crashed && "ring-2 ring-destructive",
      )}
    >
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
        <div>
          <p className="font-mono text-[0.65rem] tracking-[0.2em] uppercase">
            Agent {agent.toUpperCase()}
          </p>
          <p className="text-sm">
            {source}
            {decision?.latencyMs !== undefined
              ? ` · ${Math.round(decision.latencyMs)}ms`
              : ""}
          </p>
        </div>
        <div className="text-right">
          <p className="font-mono text-2xl tabular-nums">{score}</p>
          <p className="text-muted-foreground font-mono text-xs">
            {crashed ? "Crash" : blocked ? "BLOCKED" : "alive"}
          </p>
        </div>
      </header>
      <iframe
        ref={iframeRef}
        title={`Agent ${agent.toUpperCase()} Browser`}
        src={src}
        className="pointer-events-none h-[28rem] w-full bg-background"
      />
      <dl className="grid gap-3 border-t border-border p-4 text-xs">
        <div>
          <dt className="text-muted-foreground mb-1">Operation</dt>
          <dd className="font-mono">
            {decision?.operation ?? "…"}
            {decision?.confidence?.operation !== undefined
              ? ` · confidence ${decision.confidence.operation.toFixed(2)}`
              : ""}
          </dd>
          <ProbabilityRow
            values={{
              CLICK: ops?.CLICK,
              WAIT: ops?.WAIT,
              BLOCKED: ops?.BLOCKED,
            }}
          />
        </div>
        <div>
          <dt className="text-muted-foreground mb-1">Direction</dt>
          <dd className="font-mono">
            {decision?.targetId ?? "none"}
            {decision?.confidence?.target !== undefined
              ? ` · confidence ${decision.confidence.target.toFixed(2)}`
              : ""}
          </dd>
          <ProbabilityRow values={dirs ?? {}} />
        </div>
      </dl>
    </article>
  );
}

function ProbabilityRow({ values }: { values: Record<string, number | undefined> }) {
  const entries = Object.entries(values).filter(
    (entry): entry is [string, number] => typeof entry[1] === "number",
  );
  if (entries.length === 0) {
    return <p className="text-muted-foreground">No probabilities yet.</p>;
  }
  return (
    <ul className="mt-2 space-y-1">
      {entries.map(([name, value]) => (
        <li key={name} className="grid grid-cols-[4rem_1fr_2.5rem] items-center gap-2">
          <span className="font-mono uppercase">{name}</span>
          <span className="bg-muted h-1.5 overflow-hidden rounded-full">
            <span
              className="block h-full bg-primary"
              style={{ width: `${Math.round(value * 100)}%` }}
            />
          </span>
          <span className="font-mono text-right">{value.toFixed(2)}</span>
        </li>
      ))}
    </ul>
  );
}
