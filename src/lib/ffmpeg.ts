import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";

let ffmpeg: FFmpeg | null = null;

export async function loadFFmpeg(
  onProgress?: (message: string) => void
): Promise<FFmpeg> {
  if (ffmpeg && ffmpeg.loaded) {
    return ffmpeg;
  }

  ffmpeg = new FFmpeg();

  ffmpeg.on("log", ({ message }) => {
    console.log("[FFmpeg]", message);
  });

  onProgress?.("Loading FFmpeg core...");

  // Use self-hosted files to avoid Turbopack "expression is too dynamic" error
  const baseURL = window.location.origin;

  // Retry logic for more reliable loading
  let lastError: Error | null = null;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      await ffmpeg.load({
        coreURL: `${baseURL}/ffmpeg/ffmpeg-core.js`,
        wasmURL: `${baseURL}/ffmpeg/ffmpeg-core.wasm`,
      });

      onProgress?.("FFmpeg loaded successfully!");
      return ffmpeg;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.warn(`FFmpeg load attempt ${attempt} failed:`, err);
      if (attempt < 3) {
        onProgress?.(`Retrying... (attempt ${attempt + 1}/3)`);
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }
  }

  throw lastError || new Error("Failed to load FFmpeg after multiple attempts");
}

export interface ConvertOptions {
  fps: number;
  width: number;
  startTime: number;
  endTime: number;
  onProgress?: (progress: number) => void;
}

export async function convertToGif(
  videoFile: File,
  options: ConvertOptions
): Promise<Blob> {
  const { fps, width, startTime, endTime, onProgress } = options;

  if (!ffmpeg || !ffmpeg.loaded) {
    throw new Error("FFmpeg is not loaded");
  }

  // Extract extension from filename or infer from MIME type
  const getExtension = (file: File): string => {
    const nameExt = file.name.split(".").pop()?.toLowerCase();
    if (nameExt && ["mp4", "mov", "webm"].includes(nameExt)) {
      return nameExt;
    }
    // Fallback to MIME type
    const mimeMap: Record<string, string> = {
      "video/mp4": "mp4",
      "video/quicktime": "mov",
      "video/webm": "webm",
    };
    return mimeMap[file.type] || "mp4";
  };
  const inputFileName = `input.${getExtension(videoFile)}`;
  const outputFileName = "output.gif";
  const paletteFileName = "palette.png";

  // Write video file to FFmpeg virtual filesystem
  const videoData = await fetchFile(videoFile);
  await ffmpeg.writeFile(inputFileName, videoData);

  const duration = endTime - startTime;

  // Set up progress tracking
  ffmpeg.on("progress", ({ progress }) => {
    // Progress is 0-1, we'll split it: 0-50% for palette, 50-100% for GIF
    onProgress?.(Math.min(Math.round(progress * 100), 100));
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
    `fps=${fps},scale=${width}:-1:flags=lanczos,palettegen=stats_mode=diff`,
    "-y",
    paletteFileName,
  ]);

  // Convert to GIF using the palette
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
    `fps=${fps},scale=${width}:-1:flags=lanczos[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle`,
    "-y",
    outputFileName,
  ]);

  // Read the output GIF
  const data = await ffmpeg.readFile(outputFileName);

  // Clean up
  await ffmpeg.deleteFile(inputFileName);
  await ffmpeg.deleteFile(outputFileName);
  await ffmpeg.deleteFile(paletteFileName);

  // Create Blob from the file data (type assertion needed for SharedArrayBuffer compatibility)
  if (typeof data === "string") {
    throw new Error("Unexpected string data from FFmpeg");
  }
  return new Blob([data] as unknown as BlobPart[], { type: "image/gif" });
}
