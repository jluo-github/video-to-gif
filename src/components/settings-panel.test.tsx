import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { SettingsPanel } from "./settings-panel";

// Mock the Radix UI Slider
vi.mock("@radix-ui/react-slider", () => ({
  Root: ({ children, ...props }: React.PropsWithChildren<{ value: number[] }>) => (
    <div data-testid='slider-root' data-value={props.value?.[0]}>
      {children}
    </div>
  ),
  Track: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  Range: () => <div />,
  Thumb: () => <div />,
}));

// Mock the VideoTrimmer to avoid complex video element setup
vi.mock("./video-trimmer", () => ({
  VideoTrimmer: () => <div data-testid='video-trimmer'>Video Trimmer Mock</div>,
}));

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

  it("displays Quick Presets section", () => {
    render(<SettingsPanel {...defaultProps} />);
    expect(screen.getByText("Quick Presets")).toBeInTheDocument();
  });

  it("displays preset buttons", () => {
    render(<SettingsPanel {...defaultProps} />);
    expect(screen.getByText("Discord Sticker")).toBeInTheDocument();
    expect(screen.getByText("High Quality")).toBeInTheDocument();
    expect(screen.getByText("Email Friendly")).toBeInTheDocument();
  });

  it("displays VideoTrimmer when videoUrl is provided", () => {
    render(<SettingsPanel {...defaultProps} videoUrl='http://example.com/video.mp4' />);
    expect(screen.getByTestId("video-trimmer")).toBeInTheDocument();
  });

  it("does not display VideoTrimmer when videoUrl is not provided", () => {
    render(<SettingsPanel {...defaultProps} />);
    expect(screen.queryByTestId("video-trimmer")).not.toBeInTheDocument();
  });

  it("displays text overlay inputs when setTopText and setBottomText are provided", () => {
    render(
      <SettingsPanel
        {...defaultProps}
        topText=''
        setTopText={vi.fn()}
        bottomText=''
        setBottomText={vi.fn()}
      />,
    );
    expect(screen.getByText("Text Overlay (Meme Mode)")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("WHEN YOU...")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("...BOTTOM TEXT")).toBeInTheDocument();
  });

  it("displays Crop Video button when onCropClick is provided", () => {
    render(<SettingsPanel {...defaultProps} onCropClick={vi.fn()} />);
    expect(screen.getByText("Crop Video")).toBeInTheDocument();
  });

  it("displays slider range indicators", () => {
    render(<SettingsPanel {...defaultProps} />);
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("30")).toBeInTheDocument();
    expect(screen.getByText("240px")).toBeInTheDocument();
    expect(screen.getByText("1280px")).toBeInTheDocument();
  });
});
