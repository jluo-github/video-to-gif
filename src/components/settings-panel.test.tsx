import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SettingsPanel } from "./settings-panel";

// Mock the cn function
vi.mock("@/lib/utils", () => ({
  cn: (...inputs: string[]) => inputs.filter(Boolean).join(" "),
}));

describe("SettingsPanel", () => {
  const defaultProps = {
    fps: 15,
    setFps: vi.fn(),
    width: 480,
    setWidth: vi.fn(),
    startTime: 0,
    setStartTime: vi.fn(),
    endTime: 10,
    setEndTime: vi.fn(),
    maxDuration: 30,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the settings panel with correct heading", () => {
    render(<SettingsPanel {...defaultProps} />);
    expect(screen.getByText("Conversion Settings")).toBeInTheDocument();
  });

  it("displays current FPS value", () => {
    render(<SettingsPanel {...defaultProps} />);
    expect(screen.getByText("15 FPS")).toBeInTheDocument();
  });

  it("displays current width value", () => {
    render(<SettingsPanel {...defaultProps} />);
    expect(screen.getByText("480px")).toBeInTheDocument();
  });

  it("displays Frame Rate label", () => {
    render(<SettingsPanel {...defaultProps} />);
    expect(screen.getByText("Frame Rate")).toBeInTheDocument();
  });

  it("displays Output Width label", () => {
    render(<SettingsPanel {...defaultProps} />);
    expect(screen.getByText("Output Width")).toBeInTheDocument();
  });

  it("displays Trim Duration label", () => {
    render(<SettingsPanel {...defaultProps} />);
    expect(screen.getByText("Trim Duration")).toBeInTheDocument();
  });

  it("displays start time input with correct value", () => {
    render(<SettingsPanel {...defaultProps} />);
    const startInput = screen.getByDisplayValue("0");
    expect(startInput).toBeInTheDocument();
  });

  it("displays end time input with correct value", () => {
    render(<SettingsPanel {...defaultProps} />);
    const endInput = screen.getByDisplayValue("10");
    expect(endInput).toBeInTheDocument();
  });

  it("calls setStartTime when start input changes", () => {
    render(<SettingsPanel {...defaultProps} />);
    const startInput = screen.getByDisplayValue("0");
    fireEvent.change(startInput, { target: { value: "5" } });
    expect(defaultProps.setStartTime).toHaveBeenCalled();
  });

  it("calls setEndTime when end input changes", () => {
    render(<SettingsPanel {...defaultProps} />);
    const endInput = screen.getByDisplayValue("10");
    fireEvent.change(endInput, { target: { value: "15" } });
    expect(defaultProps.setEndTime).toHaveBeenCalled();
  });

  it("displays duration calculation", () => {
    render(<SettingsPanel {...defaultProps} />);
    expect(screen.getByText(/Duration: 10.0s of 30.0s/)).toBeInTheDocument();
  });

  it("displays slider range indicators", () => {
    render(<SettingsPanel {...defaultProps} />);
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("30")).toBeInTheDocument();
    expect(screen.getByText("240px")).toBeInTheDocument();
    expect(screen.getByText("1280px")).toBeInTheDocument();
  });
});
