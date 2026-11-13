import { StrictMode } from "react";
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { SnakeBrowser } from "@/app/browser/snake-browser";
import { BROWSER_PROTOCOL } from "@/lib/browser/protocol";

afterEach(cleanup);

describe("Snake Browser", () => {
  it("renders indexed direction buttons as real DOM targets", () => {
    render(
      <SnakeBrowser seed={21} agent="a" accent="lime" generation={1} />,
    );

    for (const id of ["up", "down", "left", "right"] as const) {
      const button = screen.getByRole("button", { name: id.toUpperCase() });
      expect(button).toHaveAttribute("data-element-id", id);
    }

    expect(screen.getByRole("button", { name: "LEFT" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "RIGHT" })).toBeEnabled();
  });
});

describe("Snake Browser under Strict Mode", () => {
  it("publishes one snapshot on mount and one per step", async () => {
    const posted: { kind: string; tick: number }[] = [];
    const parent = { postMessage: (msg: { kind: string; tick: number }) => posted.push(msg) };
    const realParent = Object.getOwnPropertyDescriptor(window, "parent");
    Object.defineProperty(window, "parent", { configurable: true, value: parent });
    try {
      render(
        <StrictMode>
          <SnakeBrowser seed={21} agent="a" accent="lime" generation={1} />
        </StrictMode>,
      );
      expect(posted.filter((m) => m.kind === "snapshot")).toHaveLength(1);

      act(() => {
        window.dispatchEvent(
          new MessageEvent("message", {
            origin: window.location.origin,
            data: { protocol: BROWSER_PROTOCOL, kind: "step", generation: 1 },
          }),
        );
      });
      const snapshots = posted.filter((m) => m.kind === "snapshot");
      expect(snapshots).toHaveLength(2);
      expect(snapshots[1].tick).toBe(1);
    } finally {
      if (realParent) Object.defineProperty(window, "parent", realParent);
    }
  });
});
