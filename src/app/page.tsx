"use client";

import { useState, useEffect, useCallback } from "react";
import { Sparkles, Wand2, AlertCircle } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { UploadZone } from "@/components/upload-zone";
import { SettingsPanel } from "@/components/settings-panel";
import { ProgressDisplay } from "@/components/progress-display";
import { ResultView } from "@/components/result-view";
import { loadFFmpeg, convertToGif } from "@/lib/ffmpeg";

type AppState = "idle" | "loading" | "ready" | "converting" | "done" | "error";

export default function Home() {
  const [state, setState] = useState<AppState>("idle");
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  // File state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoDuration, setVideoDuration] = useState(0);

  // Settings state
  const [fps, setFps] = useState(15);
  const [width, setWidth] = useState(480);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(10);

  // Progress & result state
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [gifUrl, setGifUrl] = useState<string | null>(null);
  const [gifSize, setGifSize] = useState(0);

  // Load FFmpeg on mount
  useEffect(() => {
    const init = async () => {
      setState("loading");
      try {
        await loadFFmpeg(setLoadingMessage);
        setFfmpegLoaded(true);
        setState("idle");
      } catch (err) {
        console.error("Failed to load FFmpeg:", err);
        setError("Failed to load FFmpeg. Please refresh the page.");
        setState("error");
      }
    };
    init();
  }, []);

  // Get video duration when file is selected
  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    setError(null);

    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      const duration = video.duration;
      setVideoDuration(duration);
      setStartTime(0);
      setEndTime(Math.min(duration, 10)); // Default to first 10 seconds
      URL.revokeObjectURL(video.src);
      setState("ready");
    };
    video.onerror = () => {
      setError("Could not read video metadata. The file may be corrupted.");
      setSelectedFile(null);
    };
    video.src = URL.createObjectURL(file);
  }, []);

  const handleClear = useCallback(() => {
    setSelectedFile(null);
    setVideoDuration(0);
    setState("idle");
    setError(null);
    if (gifUrl) {
      URL.revokeObjectURL(gifUrl);
      setGifUrl(null);
    }
  }, [gifUrl]);

  const handleConvert = useCallback(async () => {
    if (!selectedFile || !ffmpegLoaded) return;

    setState("converting");
    setProgress(0);
    setStatusMessage("Preparing video...");

    try {
      const blob = await convertToGif(selectedFile, {
        fps,
        width,
        startTime,
        endTime,
        onProgress: (p) => {
          setProgress(p);
          if (p < 50) {
            setStatusMessage("Generating color palette...");
          } else {
            setStatusMessage("Creating GIF frames...");
          }
        },
      });

      const url = URL.createObjectURL(blob);
      setGifUrl(url);
      setGifSize(blob.size);
      setProgress(100);
      setStatusMessage("GIF created successfully!");
      setState("done");
    } catch (err) {
      console.error("Conversion failed:", err);
      setError(
        err instanceof Error ? err.message : "Conversion failed. Please try again."
      );
      setState("error");
    }
  }, [selectedFile, ffmpegLoaded, fps, width, startTime, endTime]);

  const handleReset = useCallback(() => {
    if (gifUrl) {
      URL.revokeObjectURL(gifUrl);
    }
    setGifUrl(null);
    setGifSize(0);
    setProgress(0);
    setSelectedFile(null);
    setVideoDuration(0);
    setState("idle");
    setError(null);
  }, [gifUrl]);

  return (
    <div className='min-h-screen min-h-dvh flex flex-col'>
      {/* Header */}
      <header className='w-full px-6 py-4 flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <div className='h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/25'>
            <Sparkles className='h-5 w-5 text-white' />
          </div>
          <div>
            <h1 className='font-bold text-lg text-gray-900 dark:text-purple-100'>
              GIF Maker
            </h1>
            <p className='text-xs text-gray-700 dark:text-purple-300/60'>
              Video to GIF Converter
            </p>
          </div>
        </div>
        <ThemeToggle />
      </header>

      {/* Main Content */}
      <main className='flex-1 flex items-start sm:items-center justify-center px-4 py-4 sm:py-8 overflow-y-auto'>
        <div className='w-full max-w-2xl space-y-6'>
          {/* Hero Section */}
          <div className='text-center space-y-2 mb-4 sm:mb-8'>
            <h2 className='text-2xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-purple-500 bg-clip-text text-transparent'>
              Transform Videos to GIFs
            </h2>
            <p className='text-gray-700 dark:text-purple-300/70 max-w-md mx-auto text-sm sm:text-base'>
              Convert your videos to high-quality GIFs directly in your browser. 100%
              private — nothing is uploaded.
            </p>
          </div>

          {/* Loading State */}
          {state === "loading" && (
            <div className='p-8 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl border border-purple-500/30 text-center'>
              <div className='h-16 w-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/25 animate-pulse'>
                <Wand2 className='h-8 w-8 text-white' />
              </div>
              <p className='text-gray-900 dark:text-purple-100 font-medium'>
                {loadingMessage || "Initializing..."}
              </p>
              <p className='text-sm text-gray-700 dark:text-purple-300/60 mt-1'>
                This may take a moment on first load
              </p>
            </div>
          )}

          {/* Error State */}
          {state === "error" && error && (
            <div className='p-6 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-start gap-4'>
              <div className='h-10 w-10 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0'>
                <AlertCircle className='h-5 w-5 text-red-500' />
              </div>
              <div className='flex-1'>
                <p className='font-semibold text-red-700 dark:text-red-300'>
                  Something went wrong
                </p>
                <p className='text-sm text-red-600/70 dark:text-red-400/70 mt-1'>
                  {error}
                </p>
                <button
                  onClick={handleReset}
                  className='mt-3 text-sm font-medium text-red-600 dark:text-red-400 hover:underline'>
                  Try again
                </button>
              </div>
            </div>
          )}

          {/* Idle / Ready States */}
          {(state === "idle" || state === "ready") && (
            <>
              <UploadZone
                onFileSelect={handleFileSelect}
                selectedFile={selectedFile}
                onClear={handleClear}
                disabled={!ffmpegLoaded}
              />

              {state === "ready" && selectedFile && (
                <>
                  <SettingsPanel
                    fps={fps}
                    setFps={setFps}
                    width={width}
                    setWidth={setWidth}
                    startTime={startTime}
                    setStartTime={setStartTime}
                    endTime={endTime}
                    setEndTime={setEndTime}
                    maxDuration={videoDuration}
                  />

                  <button
                    onClick={handleConvert}
                    className='w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold text-lg shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-[1.02] transition-all duration-300 animate-glow'>
                    <Wand2 className='h-6 w-6' />
                    Convert to GIF
                  </button>
                </>
              )}
            </>
          )}

          {/* Converting State */}
          {state === "converting" && (
            <ProgressDisplay progress={progress} status={statusMessage} />
          )}

          {/* Done State */}
          {state === "done" && gifUrl && (
            <ResultView gifUrl={gifUrl} gifSize={gifSize} onReset={handleReset} />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className='w-full px-6 py-4 text-center text-sm text-gray-600 dark:text-purple-300/50'>
        <p>Built with 💜 using FFmpeg.wasm • All processing happens in your browser</p>
      </footer>
    </div>
  );
}
