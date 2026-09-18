import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SnakeBrowser } from "@/app/browser/snake-browser";

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
