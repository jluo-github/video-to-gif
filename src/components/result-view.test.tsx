import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ResultView } from "./result-view";

// Mock the formatFileSize function
vi.mock("@/lib/utils", () => ({
  formatFileSize: (bytes: number) => {
    if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`;
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${bytes} Bytes`;
  },
}));

describe("ResultView", () => {
  const mockOnReset = vi.fn();
  const defaultProps = {
    gifUrl: "blob:http://localhost:3000/test-gif-url",
    gifSize: 2097152, // 2 MB
    onReset: mockOnReset,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("displays success message", () => {
    render(<ResultView {...defaultProps} />);
    expect(screen.getByText("GIF Created Successfully!")).toBeInTheDocument();
  });

  it("displays secondary success message", () => {
    render(<ResultView {...defaultProps} />);
    expect(
      screen.getByText("Your video has been converted to a GIF")
    ).toBeInTheDocument();
  });

  it("displays the GIF preview image", () => {
    render(<ResultView {...defaultProps} />);
    const img = screen.getByRole("img", { name: "Converted GIF" });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", defaultProps.gifUrl);
  });

  it("displays the file size", () => {
    render(<ResultView {...defaultProps} />);
    expect(screen.getByText("2.0 MB")).toBeInTheDocument();
  });

  it("has a download button", () => {
    render(<ResultView {...defaultProps} />);
    expect(screen.getByText("Download GIF")).toBeInTheDocument();
  });

  it("has a new/reset button", () => {
    render(<ResultView {...defaultProps} />);
    expect(screen.getByText("New")).toBeInTheDocument();
  });

  it("calls onReset when New button is clicked", () => {
    render(<ResultView {...defaultProps} />);
    const newButton = screen.getByText("New");
    fireEvent.click(newButton);
    expect(mockOnReset).toHaveBeenCalledTimes(1);
  });
});
