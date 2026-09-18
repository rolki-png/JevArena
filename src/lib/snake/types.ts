export type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";

export type Cell = {
  x: number;
  y: number;
};

export type OfferedElement = {
  id: "up" | "down" | "left" | "right";
  direction: Direction;
};

export type SnakeState = {
  width: number;
  height: number;
  body: Cell[];
  direction: Direction;
  pendingDirection: Direction;
  food: Cell;
  score: number;
  alive: boolean;
  crashed: boolean;
  seed: number;
  rng: number;
};

export type CreateSnakeOptions = {
  seed: number;
  start?: Cell;
  direction?: Direction;
  food?: Cell;
  body?: Cell[];
};
