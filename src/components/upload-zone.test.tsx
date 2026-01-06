import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { UploadZone } from "./upload-zone";

// Mock the formatFileSize function
vi.mock("@/lib/utils", () => ({
  cn: (...inputs: string[]) => inputs.filter(Boolean).join(" "),
  formatFileSize: (bytes: number) => `${bytes} Bytes`,
}));

describe("UploadZone", () => {
  const mockOnFileSelect = vi.fn();
  const mockOnClear = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the drop zone with correct text", () => {
    render(
      <UploadZone
        onFileSelect={mockOnFileSelect}
        selectedFile={null}
        onClear={mockOnClear}
      />
    );

    expect(screen.getByText("Drop your video here")).toBeInTheDocument();
    expect(screen.getByText(/or click to browse/)).toBeInTheDocument();
    expect(screen.getByText(/MP4, MOV, WebM up to 100MB/)).toBeInTheDocument();
  });

  it("renders file input with correct accept types", () => {
    render(
      <UploadZone
        onFileSelect={mockOnFileSelect}
        selectedFile={null}
        onClear={mockOnClear}
      />
    );

    const input = document.querySelector('input[type="file"]');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("accept", "video/mp4,video/quicktime,video/webm");
  });

  it("shows file info when a file is selected", () => {
    const mockFile = new File(["video content"], "test-video.mp4", {
      type: "video/mp4",
    });

    render(
      <UploadZone
        onFileSelect={mockOnFileSelect}
        selectedFile={mockFile}
        onClear={mockOnClear}
      />
    );

    expect(screen.getByText("test-video.mp4")).toBeInTheDocument();
  });

  it("calls onClear when clear button is clicked", () => {
    const mockFile = new File(["video content"], "test-video.mp4", {
      type: "video/mp4",
    });

    render(
      <UploadZone
        onFileSelect={mockOnFileSelect}
        selectedFile={mockFile}
        onClear={mockOnClear}
      />
    );

    // Find and click the clear button (X button)
    const clearButton = screen.getByRole("button");
    fireEvent.click(clearButton);

    expect(mockOnClear).toHaveBeenCalledTimes(1);
  });

  it("disables the drop zone when disabled prop is true", () => {
    render(
      <UploadZone
        onFileSelect={mockOnFileSelect}
        selectedFile={null}
        onClear={mockOnClear}
        disabled={true}
      />
    );

    const input = document.querySelector('input[type="file"]');
    expect(input).toBeDisabled();
  });
});
