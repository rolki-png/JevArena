"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AgentPane } from "@/app/arena/agent-pane";
import { buttonVariants } from "@/components/ui/button";
import { MATCH_MS } from "@/lib/snake/constants";
import type { AgentDecision } from "@/lib/agent/types";
import type { AgentId, MatchEvent, MatchResult, TickEntry } from "@/lib/match/orchestrator";
import {
  BROWSER_PROTOCOL,
  type BrowserSnapshotMessage,
} from "@/lib/browser/protocol";
import { cn } from "@/lib/utils";

function newSeed() {
  return Math.floor(Math.random() * 1_000_000_000);
}

export function ArenaView() {
  const [generation, setGeneration] = useState(1);
  const [seeds, setSeeds] = useState(() => ({ a: newSeed(), b: newSeed() }));
  const [remainingMs, setRemainingMs] = useState(MATCH_MS);
  const [result, setResult] = useState<MatchResult | null>(null);
  const [decisions, setDecisions] = useState<Record<AgentId, AgentDecision | null>>({
    a: null,
    b: null,
  });
  const [scores, setScores] = useState<Record<AgentId, number>>({ a: 0, b: 0 });
  const [blocked, setBlocked] = useState<Record<AgentId, boolean>>({
    a: false,
    b: false,
  });
  const [crashed, setCrashed] = useState<Record<AgentId, boolean>>({
    a: false,
    b: false,
  });
  const [timeline, setTimeline] = useState<TickEntry[]>([]);
  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [selectedTick, setSelectedTick] = useState<number | null>(null);

  const generationRef = useRef(1);
  const runningRef = useRef(true);
  const inflight = useRef<Record<AgentId, AbortController | null>>({
    a: null,
    b: null,
  });
  const iframeRefs = useRef<Record<AgentId, HTMLIFrameElement | null>>({
    a: null,
    b: null,
  });
  const scoresRef = useRef({ a: 0, b: 0 });
  const startedAt = useRef(0);

  const halt = useCallback((gen: number) => {
    for (const agent of ["a", "b"] as const) {
      iframeRefs.current[agent]?.contentWindow?.postMessage(
        { protocol: BROWSER_PROTOCOL, kind: "halt", generation: gen },
        window.location.origin,
      );
      inflight.current[agent]?.abort();
      inflight.current[agent] = null;
    }
  }, []);

  const endMatch = useCallback(
    (next: MatchResult, gen: number) => {
      if (!runningRef.current || generationRef.current !== gen) return;
      runningRef.current = false;
      setResult(next);
      halt(gen);
    },
    [halt],
  );

  const requestDecision = useCallback(
    async (agent: AgentId, snapshot: BrowserSnapshotMessage["snapshot"], tick: number, gen: number) => {
      if (!runningRef.current || generationRef.current !== gen) return;
      inflight.current[agent]?.abort();
      const controller = new AbortController();
      inflight.current[agent] = controller;
      try {
        const response = await fetch("/api/agent-step", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ snapshot }),
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("agent-step failed");
        const decision = (await response.json()) as AgentDecision;
        if (generationRef.current !== gen || !runningRef.current) return;

        setDecisions((current) => ({ ...current, [agent]: decision }));
        setBlocked((current) => ({
          ...current,
          [agent]: decision.operation === "BLOCKED",
        }));
        setTimeline((current) => [
          ...current,
          {
            tick,
            agent,
            operation: decision.operation,
            targetId: decision.targetId,
            score: snapshot.score,
            alive: snapshot.alive,
            blocked: decision.operation === "BLOCKED",
            crashed: snapshot.crashed,
            source: decision.source,
            operationProbabilities: decision.operationProbabilities,
            directionProbabilities: decision.directionProbabilities,
            confidence: decision.confidence,
            latencyMs: decision.latencyMs,
          },
        ]);
        setEvents((current) => [
          ...current,
          {
            tick,
            agent,
            kind:
              decision.operation === "CLICK"
                ? "Click"
                : decision.operation === "WAIT"
                  ? "Wait"
                  : "BLOCKED",
            detail:
              decision.operation === "CLICK"
                ? `Click ${decision.targetId}`
                : decision.operation,
          },
        ]);

        if (decision.operation === "CLICK" && decision.targetId) {
          iframeRefs.current[agent]?.contentWindow?.postMessage(
            {
              protocol: BROWSER_PROTOCOL,
              kind: "click",
              generation: gen,
              elementId: decision.targetId,
            },
            window.location.origin,
          );
        }
      } catch (error) {
        if (controller.signal.aborted) return;
        if (generationRef.current !== gen || !runningRef.current) return;
        setDecisions((current) => ({
          ...current,
          [agent]: { operation: "BLOCKED", source: "blocked" },
        }));
        setBlocked((current) => ({ ...current, [agent]: true }));
        void error;
      }
    },
    [],
  );

  useEffect(() => {
    function onMessage(event: MessageEvent<BrowserSnapshotMessage>) {
      if (event.origin !== window.location.origin) return;
      const data = event.data;
      if (!data || data.protocol !== BROWSER_PROTOCOL || data.kind !== "snapshot") {
        return;
      }
      const gen = generationRef.current;
      if (data.generation !== gen) return;

      setScores((current) => {
        const previous = current[data.agent];
        if (data.snapshot.score > previous) {
          setEvents((events) => [
            ...events,
            {
              tick: data.tick,
              agent: data.agent,
              kind: "score",
              detail: `score ${data.snapshot.score}`,
            },
          ]);
        }
        const next = { ...current, [data.agent]: data.snapshot.score };
        scoresRef.current = next;
        return next;
      });

      if (data.snapshot.crashed) {
        setCrashed((current) => ({ ...current, [data.agent]: true }));
        setEvents((events) => [
          ...events,
          {
            tick: data.tick,
            agent: data.agent,
            kind: "Crash",
            detail: "Crash",
          },
        ]);
        endMatch(
          {
            winner: data.agent === "a" ? "b" : "a",
            reason: "crash",
          },
          gen,
        );
        return;
      }

      if (runningRef.current) {
        void requestDecision(data.agent, data.snapshot, data.tick, gen);
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [endMatch, requestDecision]);

  useEffect(() => {
    startedAt.current = Date.now();
    const id = window.setInterval(() => {
      if (!runningRef.current) return;
      const left = MATCH_MS - (Date.now() - startedAt.current);
      setRemainingMs(Math.max(0, left));
      if (left <= 0) {
        const a = scoresRef.current.a;
        const b = scoresRef.current.b;
        const next: MatchResult =
          a > b
            ? { winner: "a", reason: "score" }
            : b > a
              ? { winner: "b", reason: "score" }
              : { winner: "draw", reason: "draw" };
        endMatch(next, generationRef.current);
      }
    }, 50);
    return () => window.clearInterval(id);
  }, [generation, endMatch]);

  const rematch = () => {
    halt(generation);
    const nextGeneration = generation + 1;
    generationRef.current = nextGeneration;
    runningRef.current = true;
    scoresRef.current = { a: 0, b: 0 };
    setGeneration(nextGeneration);
    setSeeds({ a: newSeed(), b: newSeed() });
    setRemainingMs(MATCH_MS);
    setResult(null);
    setDecisions({ a: null, b: null });
    setScores({ a: 0, b: 0 });
    setBlocked({ a: false, b: false });
    setCrashed({ a: false, b: false });
    setTimeline([]);
    setEvents([]);
    setSelectedTick(null);
  };

  const banner = useMemo(() => {
    if (!result) return null;
    if (result.winner === "draw") {
      return result.reason === "crash"
        ? "Draw — both Crashed"
        : "Draw — scores match";
    }
    const name = result.winner === "a" ? "Agent A" : "Agent B";
    return result.reason === "crash"
      ? `${name} wins — Crash`
      : `${name} wins — score`;
  }, [result]);

  const sourceLabel = (agent: AgentId) => {
    const source = decisions[agent]?.source;
    if (source === "jev") return "Jev";
    if (source === "blocked") return "BLOCKED";
    return "Demo policy";
  };

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col gap-5 px-4 py-6 sm:px-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <p className="font-mono text-xs tracking-[0.28em] text-primary uppercase">
            JevArena
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">Arena</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <p className="font-mono text-lg tabular-nums">
            {formatClock(remainingMs)}
          </p>
          <button
            type="button"
            onClick={rematch}
            className={cn(buttonVariants({ size: "lg" }))}
          >
            Rematch
          </button>
          <Link href="/" className={cn(buttonVariants({ variant: "outline" }))}>
            Landing
          </Link>
        </div>
      </header>

      {banner ? (
        <p
          role="status"
          className="rounded-xl border border-primary/40 bg-card px-4 py-3 text-lg font-medium"
        >
          {banner}
        </p>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-2">
        <AgentPane
          agent="a"
          accent="lime"
          seed={seeds.a}
          generation={generation}
          score={scores.a}
          source={sourceLabel("a")}
          decision={decisions.a}
          blocked={blocked.a}
          crashed={crashed.a}
          iframeRef={(node) => {
            iframeRefs.current.a = node;
          }}
        />
        <AgentPane
          agent="b"
          accent="amber"
          seed={seeds.b}
          generation={generation}
          score={scores.b}
          source={sourceLabel("b")}
          decision={decisions.b}
          blocked={blocked.b}
          crashed={crashed.b}
          iframeRef={(node) => {
            iframeRefs.current.b = node;
          }}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-border bg-card/60 p-4">
          <h2 className="mb-3 text-sm font-medium">Per-tick timeline</h2>
          <div className="flex gap-1 overflow-x-auto pb-2">
            {timeline.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                Waiting for the first tick.
              </p>
            ) : (
              timeline.map((entry, index) => (
                <button
                  key={`${entry.tick}-${entry.agent}-${index}`}
                  type="button"
                  onClick={() => setSelectedTick(entry.tick)}
                  className={cn(
                    "min-w-10 rounded-md border px-2 py-1 font-mono text-[0.65rem]",
                    selectedTick === entry.tick
                      ? "border-primary bg-primary/15"
                      : "border-border",
                    entry.blocked && "border-destructive/60 text-destructive",
                    entry.crashed && "bg-destructive/20",
                  )}
                >
                  {entry.tick}:{entry.agent}
                  <span className="block">{entry.operation}</span>
                </button>
              ))
            )}
          </div>
          {selectedTick !== null ? (
            <ul className="text-muted-foreground mt-2 space-y-1 font-mono text-xs">
              {timeline
                .filter((entry) => entry.tick === selectedTick)
                .map((entry, index) => (
                  <li key={`${entry.agent}-${index}`}>
                    Agent {entry.agent.toUpperCase()} · {entry.operation}
                    {entry.targetId ? ` ${entry.targetId}` : ""} · score{" "}
                    {entry.score}
                    {entry.blocked ? " · BLOCKED" : ""}
                    {entry.alive ? "" : " · down"}
                  </li>
                ))}
            </ul>
          ) : null}
        </div>
        <div className="rounded-2xl border border-border bg-card/60 p-4">
          <h2 className="mb-3 text-sm font-medium">Event log</h2>
          <ol className="max-h-56 space-y-1 overflow-y-auto font-mono text-xs">
            {events.length === 0 ? (
              <li className="text-muted-foreground">No events yet.</li>
            ) : (
              events
                .slice()
                .reverse()
                .map((event, index) => (
                  <li
                    key={`${event.tick}-${event.agent}-${event.kind}-${index}`}
                    className={cn(
                      event.kind === "BLOCKED" && "text-destructive",
                      event.kind === "Crash" && "font-semibold text-destructive",
                    )}
                  >
                    t{event.tick} · Agent {event.agent.toUpperCase()} ·{" "}
                    {event.kind}
                    {event.kind === "Click" ? ` ${event.detail}` : ""}
                    {event.kind === "score" ? ` ${event.detail}` : ""}
                  </li>
                ))
            )}
          </ol>
        </div>
      </section>
    </main>
  );
}

function formatClock(ms: number) {
  const total = Math.max(0, ms) / 1000;
  return `${total.toFixed(1)}s`;
}
