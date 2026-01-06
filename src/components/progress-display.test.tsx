import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProgressDisplay } from "./progress-display";

describe("ProgressDisplay", () => {
  it("shows the progress percentage", () => {
    render(<ProgressDisplay progress={50} status='Processing...' />);
    expect(screen.getByText("50%")).toBeInTheDocument();
  });

  it("shows the status message", () => {
    render(<ProgressDisplay progress={25} status='Generating color palette...' />);
    expect(screen.getByText("Generating color palette...")).toBeInTheDocument();
  });

  it('shows "Converting..." when progress is less than 100', () => {
    render(<ProgressDisplay progress={75} status='Working...' />);
    expect(screen.getByText("Converting...")).toBeInTheDocument();
  });

  it('shows "Complete!" when progress is 100', () => {
    render(<ProgressDisplay progress={100} status='Done!' />);
    expect(screen.getByText("Complete!")).toBeInTheDocument();
  });

  it("rounds progress percentage", () => {
    render(<ProgressDisplay progress={33.7} status='Processing...' />);
    expect(screen.getByText("34%")).toBeInTheDocument();
  });

  it("shows 0% at start", () => {
    render(<ProgressDisplay progress={0} status='Starting...' />);
    expect(screen.getByText("0%")).toBeInTheDocument();
  });
});
