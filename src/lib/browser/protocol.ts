import type { BoardSnapshot } from "@/lib/agent/types";

export const BROWSER_PROTOCOL = "jevarena-browser-v1";

export type BrowserSnapshotMessage = {
  protocol: typeof BROWSER_PROTOCOL;
  kind: "snapshot";
  generation: number;
  agent: "a" | "b";
  tick: number;
  snapshot: BoardSnapshot;
};

export type BrowserClickMessage = {
  protocol: typeof BROWSER_PROTOCOL;
  kind: "click";
  generation: number;
  elementId: string;
};

export type BrowserHaltMessage = {
  protocol: typeof BROWSER_PROTOCOL;
  kind: "halt";
  generation: number;
};

export type BrowserToParent = BrowserSnapshotMessage;
export type ParentToBrowser = BrowserClickMessage | BrowserHaltMessage;
