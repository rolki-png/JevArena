import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ArenaPage from "./page";

describe("Arena", () => {
  it("renders a dedicated Arena route for Spectators", () => {
    render(<ArenaPage />);

    expect(screen.getByRole("heading", { name: "Arena" })).toBeInTheDocument();
    expect(screen.getByText(/Match/i)).toBeInTheDocument();
  });
});
