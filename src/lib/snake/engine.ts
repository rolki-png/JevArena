import {
  BOARD_SIZE,
  DIRECTIONS,
  DIRECTION_IDS,
  INITIAL_LENGTH,
} from "@/lib/snake/constants";
import { nextRng } from "@/lib/snake/rng";
import type {
  Cell,
  CreateSnakeOptions,
  Direction,
  OfferedElement,
  SnakeState,
} from "@/lib/snake/types";

const DELTA: Record<Direction, Cell> = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

const REVERSE: Record<Direction, Direction> = {
  UP: "DOWN",
  DOWN: "UP",
  LEFT: "RIGHT",
  RIGHT: "LEFT",
};

export function cellsEqual(a: Cell, b: Cell): boolean {
  return a.x === b.x && a.y === b.y;
}

export function createSnake(options: CreateSnakeOptions): SnakeState {
  const start = options.start ?? { x: INITIAL_LENGTH, y: Math.floor(BOARD_SIZE / 2) };
  const direction = options.direction ?? "RIGHT";
  const delta = DELTA[direction];
  const body =
    options.body ??
    Array.from({ length: INITIAL_LENGTH }, (_, index) => ({
      x: start.x - delta.x * index,
      y: start.y - delta.y * index,
    }));

  let rng = options.seed;
  let food: Cell;
  if (options.food) {
    food = options.food;
  } else {
    const placed = placeFood({
      width: BOARD_SIZE,
      height: BOARD_SIZE,
      body,
      rng,
    });
    food = placed.cell;
    rng = placed.rng;
  }

  return {
    width: BOARD_SIZE,
    height: BOARD_SIZE,
    body,
    direction,
    pendingDirection: direction,
    food,
    score: 0,
    alive: true,
    crashed: false,
    seed: options.seed,
    rng,
  };
}

export function applyClick(state: SnakeState, direction: Direction): SnakeState {
  if (!state.alive) return state;
  if (direction === REVERSE[state.direction]) return state;
  return { ...state, pendingDirection: direction };
}

export function offeredElements(state: SnakeState): OfferedElement[] {
  if (!state.alive) return [];
  return DIRECTIONS.flatMap((direction) => {
    if (!isSafeDirection(state, direction)) return [];
    return [
      {
        id: DIRECTION_IDS[direction],
        direction,
      },
    ];
  });
}

export function step(state: SnakeState): SnakeState {
  if (!state.alive) return state;

  const direction = state.pendingDirection;
  const nextHead = add(state.body[0], DELTA[direction]);

  if (outOfBounds(state, nextHead) || hitsBody(state, nextHead)) {
    return {
      ...state,
      direction,
      pendingDirection: direction,
      alive: false,
      crashed: true,
    };
  }

  const ate = cellsEqual(nextHead, state.food);
  const body = [nextHead, ...state.body];
  if (!ate) body.pop();

  let food = state.food;
  let rng = state.rng;
  if (ate) {
    const placed = placeFood({
      width: state.width,
      height: state.height,
      body,
      rng,
    });
    food = placed.cell;
    rng = placed.rng;
  }

  return {
    ...state,
    body,
    direction,
    pendingDirection: direction,
    food,
    rng,
    score: ate ? state.score + 1 : state.score,
  };
}

function isSafeDirection(state: SnakeState, direction: Direction): boolean {
  if (direction === REVERSE[state.direction]) return false;
  const nextHead = add(state.body[0], DELTA[direction]);
  if (outOfBounds(state, nextHead)) return false;
  return !hitsBody(state, nextHead);
}

function hitsBody(state: SnakeState, nextHead: Cell): boolean {
  const ate = cellsEqual(nextHead, state.food);
  const occupied = ate ? state.body : state.body.slice(0, -1);
  return occupied.some((cell) => cellsEqual(cell, nextHead));
}

function outOfBounds(state: SnakeState, cell: Cell): boolean {
  return cell.x < 0 || cell.y < 0 || cell.x >= state.width || cell.y >= state.height;
}

function add(cell: Cell, delta: Cell): Cell {
  return { x: cell.x + delta.x, y: cell.y + delta.y };
}

function placeFood(input: {
  width: number;
  height: number;
  body: Cell[];
  rng: number;
}): { cell: Cell; rng: number } {
  const empty: Cell[] = [];
  for (let y = 0; y < input.height; y += 1) {
    for (let x = 0; x < input.width; x += 1) {
      if (!input.body.some((cell) => cell.x === x && cell.y === y)) {
        empty.push({ x, y });
      }
    }
  }
  const rolled = nextRng(input.rng);
  const cell = empty[Math.floor(rolled.value * empty.length)] ?? { x: 0, y: 0 };
  return { cell, rng: rolled.rng };
}
