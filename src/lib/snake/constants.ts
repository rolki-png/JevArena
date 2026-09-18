export const BOARD_SIZE = 13;
export const STEP_MS = 230;
export const MATCH_MS = 60_000;
export const INITIAL_LENGTH = 3;

export const DIRECTIONS = ["UP", "DOWN", "LEFT", "RIGHT"] as const;
export const DIRECTION_IDS = {
  UP: "up",
  DOWN: "down",
  LEFT: "left",
  RIGHT: "right",
} as const;

export const ID_TO_DIRECTION = {
  up: "UP",
  down: "DOWN",
  left: "LEFT",
  right: "RIGHT",
} as const;
