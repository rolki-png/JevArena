import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import LandingPage from "./page";

describe("Landing", () => {
  it("renders the JevArena pitch, explains how the duel works, and links to the Arena", () => {
    render(<LandingPage />);

    expect(
      screen.getByRole("heading", { name: "JevArena" }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/two independent Jev Agents play Snake/i),
    ).toBeInTheDocument();

    const howItWorks = screen.getByRole("region", {
      name: /how the duel works/i,
    });
    expect(howItWorks).toHaveTextContent(/60-second Match/i);
    expect(howItWorks).toHaveTextContent(/Crash/i);
    expect(howItWorks).toHaveTextContent(/Click/i);
    expect(howItWorks).toHaveTextContent(/Wait/i);

    const enterArena = screen.getByRole("link", { name: /enter the arena/i });
    expect(enterArena).toHaveAttribute("href", "/arena");
  });
});
