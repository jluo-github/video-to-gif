/// <reference lib="webworker" />

import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";

// Message types from main thread
export type WorkerMessage =
  | { type: "load" }
  | {
      type: "convert";
      file: File;
      options: ConvertOptions;
      textOverlayBlob?: Blob;
    };

// Response types to main thread
export type WorkerResponse =
  | { type: "loadProgress"; message: string }
  | { type: "loaded" }
  | { type: "progress"; progress: number; status: string }
  | { type: "done"; gifBlob: Blob; size: number }
  | { type: "error"; message: string };

// Convert options
export interface ConvertOptions {
  fps: number;
  width: number;
  startTime: number;
  endTime: number;
  crop?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

let ffmpeg: FFmpeg | null = null;

// Post message helper with proper typing
function postResponse(response: WorkerResponse) {
  self.postMessage(response);
}

// Get file extension from file
function getExtension(file: File): string {
  const nameExt = file.name.split(".").pop()?.toLowerCase();
  if (nameExt && ["mp4", "mov", "webm"].includes(nameExt)) {
    return nameExt;
  }
  const mimeMap: Record<string, string> = {
    "video/mp4": "mp4",
    "video/quicktime": "mov",
    "video/webm": "webm",
  };
  return mimeMap[file.type] || "mp4";
}

// Load FFmpeg
async function loadFFmpeg(): Promise<void> {
  if (ffmpeg && ffmpeg.loaded) {
    postResponse({ type: "loaded" });
    return;
  }

  ffmpeg = new FFmpeg();

  ffmpeg.on("log", ({ message }) => {
    console.log("[FFmpeg Worker]", message);
  });

  postResponse({ type: "loadProgress", message: "Loading FFmpeg core..." });

  // Get base URL from worker location
  const baseURL = self.location.origin;

  // Retry logic for reliable loading
  let lastError: Error | null = null;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      await ffmpeg.load({
        coreURL: `${baseURL}/ffmpeg/ffmpeg-core.js`,
        wasmURL: `${baseURL}/ffmpeg/ffmpeg-core.wasm`,
      });

      postResponse({
        type: "loadProgress",
        message: "FFmpeg loaded successfully!",
      });
      postResponse({ type: "loaded" });
      return;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.warn(`FFmpeg load attempt ${attempt} failed:`, err);
      if (attempt < 3) {
        postResponse({
          type: "loadProgress",
          message: `Retrying... (attempt ${attempt + 1}/3)`,
        });
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }
  }

  throw lastError || new Error("Failed to load FFmpeg after multiple attempts");
}

// Convert video to GIF
async function convertToGif(
  file: File,
  options: ConvertOptions,
  textOverlayBlob?: Blob
): Promise<void> {
  if (!ffmpeg || !ffmpeg.loaded) {
    throw new Error("FFmpeg is not loaded");
  }

  const { fps, width, startTime, endTime, crop } = options;

  const inputFileName = `input.${getExtension(file)}`;
  const outputFileName = "output.gif";
  const paletteFileName = "palette.png";
  const textFileName = "text.png";

  // Write video file to FFmpeg virtual filesystem
  postResponse({ type: "progress", progress: 5, status: "Loading video..." });
  const videoData = await fetchFile(file);
  await ffmpeg.writeFile(inputFileName, videoData);

  // Write text overlay if provided
  const hasTextOverlay = textOverlayBlob && textOverlayBlob.size > 0;
  if (hasTextOverlay) {
    const textData = await fetchFile(textOverlayBlob);
    await ffmpeg.writeFile(textFileName, textData);
  }

  const duration = endTime - startTime;

  // Set up progress tracking
  ffmpeg.on("progress", ({ progress }) => {
    // Scale progress: 10-90% for actual conversion
    const scaledProgress = 10 + Math.min(Math.round(progress * 80), 80);
    const status =
      progress < 0.5 ? "Generating color palette..." : "Creating GIF frames...";
    postResponse({ type: "progress", progress: scaledProgress, status });
  });

  // Build the filter string
  let scaleFilter = `fps=${fps},scale=${width}:-1:flags=lanczos`;

  // Add crop filter if specified
  if (crop) {
    const cropFilter = `crop=${crop.width}:${crop.height}:${crop.x}:${crop.y}`;
    scaleFilter = `${cropFilter},${scaleFilter}`;
  }

  postResponse({
    type: "progress",
    progress: 10,
    status: "Generating color palette...",
  });

  // Generate color palette for better quality
  await ffmpeg.exec([
    "-ss",
    startTime.toString(),
    "-t",
    duration.toString(),
    "-i",
    inputFileName,
    "-vf",
    `${scaleFilter},palettegen=stats_mode=diff`,
    "-y",
    paletteFileName,
  ]);

  postResponse({
    type: "progress",
    progress: 50,
    status: "Creating GIF frames...",
  });

  // Build the final conversion command
  if (hasTextOverlay) {
    // With text overlay: use filter_complex
    await ffmpeg.exec([
      "-ss",
      startTime.toString(),
      "-t",
      duration.toString(),
      "-i",
      inputFileName,
      "-i",
      paletteFileName,
      "-i",
      textFileName,
      "-filter_complex",
      `[0:v]${scaleFilter}[scaled];[scaled][2:v]overlay=0:0[overlaid];[overlaid][1:v]paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle`,
      "-y",
      outputFileName,
    ]);
  } else {
    // Without text overlay: simpler command
    await ffmpeg.exec([
      "-ss",
      startTime.toString(),
      "-t",
      duration.toString(),
      "-i",
      inputFileName,
      "-i",
      paletteFileName,
      "-lavfi",
      `${scaleFilter}[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle`,
      "-y",
      outputFileName,
    ]);
  }

  postResponse({ type: "progress", progress: 95, status: "Finalizing..." });

  // Read the output GIF
  const data = await ffmpeg.readFile(outputFileName);

  // Clean up
  await ffmpeg.deleteFile(inputFileName);
  await ffmpeg.deleteFile(outputFileName);
  await ffmpeg.deleteFile(paletteFileName);
  if (hasTextOverlay) {
    await ffmpeg.deleteFile(textFileName);
  }

  // Create Blob from the file data
  if (typeof data === "string") {
    throw new Error("Unexpected string data from FFmpeg");
  }

  const gifBlob = new Blob([data] as unknown as BlobPart[], {
    type: "image/gif",
  });

  postResponse({
    type: "done",
    gifBlob,
    size: gifBlob.size,
  });
}

// Message handler
self.onmessage = async (event: MessageEvent<WorkerMessage>) => {
  const message = event.data;

  try {
    switch (message.type) {
      case "load":
        await loadFFmpeg();
        break;

      case "convert":
        postResponse({
          type: "progress",
          progress: 0,
          status: "Preparing video...",
        });
        await convertToGif(
          message.file,
          message.options,
          message.textOverlayBlob
        );
        break;

      default:
        postResponse({
          type: "error",
          message: `Unknown message type`,
        });
    }
  } catch (error) {
    postResponse({
      type: "error",
      message: error instanceof Error ? error.message : String(error),
    });
  }
};

// Export for TypeScript (this file is a module)
export {};
