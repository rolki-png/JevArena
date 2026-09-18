import { describe, expect, it } from "vitest";
import {
  applyClick,
  createSnake,
  offeredElements,
  step,
} from "@/lib/snake/engine";
import { BOARD_SIZE } from "@/lib/snake/constants";
import type { SnakeState } from "@/lib/snake/types";

function head(state: SnakeState) {
  return state.body[0];
}

describe("Snake engine", () => {
  it("moves the head one cell in the current direction", () => {
    const start = createSnake({ seed: 1 });
    const before = head(start);
    const next = step(start);
    expect(head(next)).toEqual({ x: before.x + 1, y: before.y });
    expect(next.alive).toBe(true);
    expect(next.score).toBe(0);
  });

  it("grows and scores when the head reaches food", () => {
    let state = createSnake({
      seed: 7,
      start: { x: 3, y: 6 },
      direction: "RIGHT",
      food: { x: 4, y: 6 },
    });
    const length = state.body.length;
    state = step(state);
    expect(head(state)).toEqual({ x: 4, y: 6 });
    expect(state.score).toBe(1);
    expect(state.body.length).toBe(length + 1);
    expect(state.food).not.toEqual({ x: 4, y: 6 });
  });

  it("Crashes on a wall", () => {
    let state = createSnake({
      seed: 3,
      start: { x: BOARD_SIZE - 1, y: 6 },
      direction: "RIGHT",
      food: { x: 1, y: 1 },
    });
    state = step(state);
    expect(state.alive).toBe(false);
    expect(state.crashed).toBe(true);
  });

  it("Crashes on itself", () => {
    let state = createSnake({
      seed: 4,
      start: { x: 5, y: 5 },
      direction: "RIGHT",
      food: { x: 1, y: 1 },
      body: [
        { x: 5, y: 5 },
        { x: 4, y: 5 },
        { x: 4, y: 4 },
        { x: 5, y: 4 },
        { x: 6, y: 4 },
        { x: 6, y: 5 },
      ],
    });
    state = applyClick(state, "UP");
    state = step(state);
    expect(state.alive).toBe(false);
    expect(state.crashed).toBe(true);
  });

  it("does not offer illegal reverse as a safe Click target", () => {
    const state = createSnake({
      seed: 5,
      start: { x: 6, y: 6 },
      direction: "RIGHT",
      food: { x: 1, y: 1 },
    });
    const ids = offeredElements(state).map((el) => el.id);
    expect(ids).not.toContain("left");
    expect(ids).toContain("up");
    expect(ids).toContain("down");
    expect(ids).toContain("right");
  });

  it("independent food seeds produce different food layouts", () => {
    const foodsA: string[] = [];
    const foodsB: string[] = [];
    let a = createSnake({ seed: 11, start: { x: 2, y: 6 }, direction: "RIGHT" });
    let b = createSnake({ seed: 99, start: { x: 2, y: 6 }, direction: "RIGHT" });
    for (let i = 0; i < 8; i += 1) {
      foodsA.push(`${a.food.x},${a.food.y}`);
      foodsB.push(`${b.food.x},${b.food.y}`);
      a = step(a);
      b = step(b);
    }
    expect(foodsA.join("|")).not.toEqual(foodsB.join("|"));
  });
});
