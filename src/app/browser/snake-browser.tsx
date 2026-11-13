"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  applyClick,
  createSnake,
  offeredElements,
  step,
} from "@/lib/snake/engine";
import { ID_TO_DIRECTION } from "@/lib/snake/constants";
import type { SnakeState } from "@/lib/snake/types";
import { toSnapshot } from "@/lib/match/orchestrator";
import {
  BROWSER_PROTOCOL,
  type ParentToBrowser,
} from "@/lib/browser/protocol";
import { cn } from "@/lib/utils";

const LABELS = {
  up: "UP",
  down: "DOWN",
  left: "LEFT",
  right: "RIGHT",
} as const;

type Accent = "lime" | "amber";

export function SnakeBrowser({
  seed,
  agent,
  accent,
  generation,
}: {
  seed: number;
  agent: "a" | "b";
  accent: Accent;
  generation: number;
}) {
  const [state, setState] = useState(() => createSnake({ seed }));
  const [flashId, setFlashId] = useState<string | null>(null);
  const [boardFlash, setBoardFlash] = useState(false);
  const tickRef = useRef(0);
  const runningRef = useRef(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const publish = useCallback(
    (next: SnakeState) => {
      if (window.parent === window) return;
      window.parent.postMessage(
        {
          protocol: BROWSER_PROTOCOL,
          kind: "snapshot",
          generation,
          agent,
          tick: tickRef.current,
          snapshot: toSnapshot(next),
        },
        window.location.origin,
      );
    },
    [agent, generation],
  );

  const clickDirection = useCallback((elementId: string) => {
    const direction =
      ID_TO_DIRECTION[elementId as keyof typeof ID_TO_DIRECTION];
    if (!direction) return;
    setFlashId(elementId);
    setBoardFlash(true);
    window.setTimeout(() => setFlashId(null), 180);
    window.setTimeout(() => setBoardFlash(false), 180);
    setState((current) => {
      const offered = offeredElements(current);
      if (!offered.some((el) => el.id === elementId)) return current;
      return applyClick(current, direction);
    });
  }, []);

  useEffect(() => {
    runningRef.current = true;
    publish(createSnake({ seed }));
  }, [publish, seed, generation]);

  useEffect(() => {
    function onMessage(event: MessageEvent<ParentToBrowser>) {
      if (event.origin !== window.location.origin) return;
      const data = event.data;
      if (!data || data.protocol !== BROWSER_PROTOCOL) return;
      if (data.generation !== generation) return;
      if (data.kind === "halt") {
        runningRef.current = false;
        return;
      }
      if (data.kind === "step") {
        // The Arena drives ticks: step only once it has applied or resolved
        // the decision for the previous snapshot.
        if (!runningRef.current) return;
        setState((current) => {
          if (!current.alive) return current;
          const next = step(current);
          tickRef.current += 1;
          publish(next);
          return next;
        });
        return;
      }
      if (data.kind === "click") {
        const button = document.querySelector<HTMLButtonElement>(
          `[data-element-id="${data.elementId}"]`,
        );
        button?.click();
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [generation, publish]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    drawBoard(ctx, canvas.width, state, accent, boardFlash);
  }, [state, accent, boardFlash]);

  const offeredIds = new Set(offeredElements(state).map((el) => el.id));

  return (
    <div className="bg-background flex min-h-dvh flex-col gap-3 p-3">
      <header className="flex items-center justify-between gap-3">
        <p className="font-mono text-[0.65rem] tracking-[0.22em] text-primary uppercase">
          Agent {agent.toUpperCase()} · Browser
        </p>
        <p className="font-mono text-xs">
          score {state.score}
          {state.crashed ? " · Crash" : ""}
        </p>
      </header>
      <canvas
        ref={canvasRef}
        width={390}
        height={390}
        className={cn(
          "aspect-square w-full rounded-xl border border-border",
          boardFlash && "ring-2 ring-primary",
        )}
      />
      <div className="grid grid-cols-3 gap-2 self-center">
        <span />
        <DirectionButton
          id="up"
          label={LABELS.up}
          disabled={!offeredIds.has("up")}
          flashed={flashId === "up"}
          onClick={clickDirection}
        />
        <span />
        <DirectionButton
          id="left"
          label={LABELS.left}
          disabled={!offeredIds.has("left")}
          flashed={flashId === "left"}
          onClick={clickDirection}
        />
        <DirectionButton
          id="down"
          label={LABELS.down}
          disabled={!offeredIds.has("down")}
          flashed={flashId === "down"}
          onClick={clickDirection}
        />
        <DirectionButton
          id="right"
          label={LABELS.right}
          disabled={!offeredIds.has("right")}
          flashed={flashId === "right"}
          onClick={clickDirection}
        />
      </div>
    </div>
  );
}

function DirectionButton({
  id,
  label,
  disabled,
  flashed,
  onClick,
}: {
  id: "up" | "down" | "left" | "right";
  label: string;
  disabled: boolean;
  flashed: boolean;
  onClick: (id: string) => void;
}) {
  return (
    <button
      type="button"
      data-element-id={id}
      disabled={disabled}
      onClick={() => onClick(id)}
      className={cn(
        "h-11 rounded-lg border font-mono text-xs tracking-wide",
        disabled
          ? "border-border text-muted-foreground opacity-40"
          : "border-primary/40 bg-card hover:bg-accent",
        flashed && "bg-primary text-primary-foreground",
      )}
    >
      {label}
    </button>
  );
}

function drawBoard(
  ctx: CanvasRenderingContext2D,
  size: number,
  state: SnakeState,
  accent: Accent,
  flash: boolean,
) {
  const cell = size / state.width;
  ctx.fillStyle = "oklch(0.19 0.02 150)";
  ctx.fillRect(0, 0, size, size);
  ctx.strokeStyle = "oklch(0.28 0.02 150)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= state.width; i += 1) {
    ctx.beginPath();
    ctx.moveTo(i * cell, 0);
    ctx.lineTo(i * cell, size);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i * cell);
    ctx.lineTo(size, i * cell);
    ctx.stroke();
  }
  ctx.fillStyle = "oklch(0.92 0.04 120)";
  ctx.fillRect(state.food.x * cell + 3, state.food.y * cell + 3, cell - 6, cell - 6);
  ctx.fillStyle =
    accent === "lime" ? "oklch(0.86 0.2 132)" : "oklch(0.82 0.14 75)";
  state.body.forEach((part, index) => {
    ctx.globalAlpha = index === 0 ? 1 : 0.75;
    ctx.fillRect(part.x * cell + 2, part.y * cell + 2, cell - 4, cell - 4);
  });
  ctx.globalAlpha = 1;
  if (flash) {
    ctx.fillStyle = "oklch(0.86 0.2 132 / 18%)";
    ctx.fillRect(0, 0, size, size);
  }
}
