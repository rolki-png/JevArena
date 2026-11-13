import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ArenaView } from "@/app/arena/arena-view";
import { BROWSER_PROTOCOL } from "@/lib/browser/protocol";
import { STEP_MS } from "@/lib/snake/constants";

const DELAY_MS = 500;

function snapshot() {
  return {
    width: 13,
    height: 13,
    body: [{ x: 6, y: 6 }],
    direction: "RIGHT",
    food: { x: 1, y: 1 },
    score: 0,
    alive: true,
    crashed: false,
    offered: [{ id: "up", label: "UP" }],
  };
}

describe("Arena with a slow decision", () => {
  const signals: AbortSignal[] = [];

  beforeEach(() => {
    vi.useFakeTimers();
    signals.length = 0;
    vi.stubGlobal(
      "fetch",
      vi.fn((_url: string, init: RequestInit) => {
        signals.push(init.signal as AbortSignal);
        return new Promise((resolve) => {
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => ({
                  operation: "CLICK",
                  targetId: "up",
                  source: "demo-policy",
                }),
              }),
            DELAY_MS,
          );
        });
      }),
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("applies every Click, steps only afterwards and aborts nothing mid-Match", async () => {
    render(<ArenaView />);
    const frame = screen.getByTitle("Agent A Browser") as HTMLIFrameElement;
    const post = vi.spyOn(frame.contentWindow!, "postMessage");
    const kinds = () => post.mock.calls.map((call) => call[0].kind);

    const sendSnapshot = (tick: number) =>
      act(async () => {
        window.dispatchEvent(
          new MessageEvent("message", {
            origin: window.location.origin,
            data: {
              protocol: BROWSER_PROTOCOL,
              kind: "snapshot",
              generation: 1,
              agent: "a",
              tick,
              snapshot: snapshot(),
            },
          }),
        );
      });

    for (let tick = 0; tick < 3; tick += 1) {
      await sendSnapshot(tick);
      await act(async () => {
        await vi.advanceTimersByTimeAsync(DELAY_MS - 1);
      });
      // Still waiting for the decision: no Click, no step.
      expect(kinds().filter((k) => k === "click")).toHaveLength(tick);
      expect(kinds().filter((k) => k === "step")).toHaveLength(tick);

      await act(async () => {
        await vi.advanceTimersByTimeAsync(1);
      });
      expect(kinds().filter((k) => k === "click")).toHaveLength(tick + 1);
      // The decision took longer than STEP_MS, so the step follows at once.
      await act(async () => {
        await vi.advanceTimersByTimeAsync(STEP_MS);
      });
      expect(kinds().filter((k) => k === "step")).toHaveLength(tick + 1);
      expect(kinds().slice(-2)).toEqual(["click", "step"]);
    }

    expect(signals).toHaveLength(3);
    expect(signals.every((signal) => !signal.aborted)).toBe(true);
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });
});
