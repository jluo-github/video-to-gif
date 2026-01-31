"use client";

import { useEffect, useCallback, useState } from "react";
import { Sparkles, Wand2, AlertCircle, Loader2 } from "lucide-react";
import { Area } from "react-easy-crop";
import { ThemeToggle } from "@/components/theme-toggle";
import { UploadZone } from "@/components/upload-zone";
import { SettingsPanel } from "@/components/settings-panel";
import { ProgressDisplay } from "@/components/progress-display";
import { ResultView } from "@/components/result-view";
import { CropModal } from "@/components/crop-modal";
import { useAppStore, CropArea } from "@/store/useAppStore";
import { getFFmpegWorker } from "@/lib/ffmpeg-worker-api";
import { renderTextOverlay, getOverlayDimensions } from "@/lib/text-renderer";

export default function Home() {
  // Select state from store
  const appState = useAppStore((s) => s.appState);
  const ffmpegLoaded = useAppStore((s) => s.ffmpegLoaded);
  const loadingMessage = useAppStore((s) => s.loadingMessage);
  const error = useAppStore((s) => s.error);

  const file = useAppStore((s) => s.file);
  const videoUrl = useAppStore((s) => s.videoUrl);
  const videoDuration = useAppStore((s) => s.videoDuration);
  const originalWidth = useAppStore((s) => s.originalWidth);
  const originalHeight = useAppStore((s) => s.originalHeight);

  const fps = useAppStore((s) => s.fps);
  const width = useAppStore((s) => s.width);
  const startTime = useAppStore((s) => s.startTime);
  const endTime = useAppStore((s) => s.endTime);

  const cropArea = useAppStore((s) => s.cropArea);
  const topText = useAppStore((s) => s.topText);
  const bottomText = useAppStore((s) => s.bottomText);

  const progress = useAppStore((s) => s.progress);
  const statusMessage = useAppStore((s) => s.statusMessage);
  const gifUrl = useAppStore((s) => s.gifUrl);
  const gifSize = useAppStore((s) => s.gifSize);

  // Actions from store
  const setAppState = useAppStore((s) => s.setAppState);
  const setFfmpegLoaded = useAppStore((s) => s.setFfmpegLoaded);
  const setLoadingMessage = useAppStore((s) => s.setLoadingMessage);
  const setError = useAppStore((s) => s.setError);
  const setFile = useAppStore((s) => s.setFile);
  const setVideoMetadata = useAppStore((s) => s.setVideoMetadata);
  const setFps = useAppStore((s) => s.setFps);
  const setWidth = useAppStore((s) => s.setWidth);
  const setStartTime = useAppStore((s) => s.setStartTime);
  const setEndTime = useAppStore((s) => s.setEndTime);
  const setCropArea = useAppStore((s) => s.setCropArea);
  const setTopText = useAppStore((s) => s.setTopText);
  const setBottomText = useAppStore((s) => s.setBottomText);
  const setProgress = useAppStore((s) => s.setProgress);
  const setResult = useAppStore((s) => s.setResult);
  const reset = useAppStore((s) => s.reset);
  const clearFile = useAppStore((s) => s.clearFile);

  // Crop modal state
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);

  // Load FFmpeg worker on mount
  useEffect(() => {
    const init = async () => {
      setAppState("loading");
      try {
        const worker = getFFmpegWorker();
        await worker.load(setLoadingMessage);
        setFfmpegLoaded(true);
        setAppState("idle");
      } catch (err) {
        console.error("Failed to load FFmpeg:", err);
        setError("Failed to load FFmpeg. Please refresh the page.");
      }
    };
    init();

    // Cleanup worker on unmount
    return () => {
      getFFmpegWorker().terminate();
    };
  }, [setAppState, setLoadingMessage, setFfmpegLoaded, setError]);

  // Handle file selection
  const handleFileSelect = useCallback(
    (selectedFile: File) => {
      setFile(selectedFile);

      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        setVideoMetadata({
          duration: video.duration,
          width: video.videoWidth,
          height: video.videoHeight,
        });
        URL.revokeObjectURL(video.src);
      };
      video.onerror = () => {
        setError("Could not read video metadata. The file may be corrupted.");
        setFile(null);
      };
      video.src = URL.createObjectURL(selectedFile);
    },
    [setFile, setVideoMetadata, setError],
  );

  // Handle clear
  const handleClear = useCallback(() => {
    clearFile();
  }, [clearFile]);

  // Handle crop complete
  const handleCropComplete = useCallback(
    (area: Area | null) => {
      if (area) {
        const cropData: CropArea = {
          x: Math.round(area.x),
          y: Math.round(area.y),
          width: Math.round(area.width),
          height: Math.round(area.height),
        };
        setCropArea(cropData);
      } else {
        setCropArea(null);
      }
    },
    [setCropArea],
  );

  // Handle convert
  const handleConvert = useCallback(async () => {
    if (!file || !ffmpegLoaded) return;

    setAppState("converting");
    setProgress(0, "Preparing video...");

    try {
      // Generate text overlay if needed
      let textOverlayBlob: Blob | undefined;
      if (topText.trim() || bottomText.trim()) {
        setProgress(2, "Rendering text overlay...");
        const dimensions = getOverlayDimensions(originalWidth, originalHeight, width);
        const blob = await renderTextOverlay(
          topText,
          bottomText,
          dimensions.width,
          dimensions.height,
        );
        if (blob) {
          textOverlayBlob = blob;
        }
      }

      const worker = getFFmpegWorker();
      const blob = await worker.convert(
        file,
        {
          fps,
          width,
          startTime,
          endTime,
          crop: cropArea ?? undefined,
        },
        (p, status) => {
          setProgress(p, status);
        },
        textOverlayBlob,
      );

      const url = URL.createObjectURL(blob);
      setResult(url, blob.size);
    } catch (err) {
      console.error("Conversion failed:", err);
      setError(
        err instanceof Error ? err.message : "Conversion failed. Please try again.",
      );
    }
  }, [
    file,
    ffmpegLoaded,
    fps,
    width,
    startTime,
    endTime,
    cropArea,
    topText,
    bottomText,
    originalWidth,
    originalHeight,
    setAppState,
    setProgress,
    setResult,
    setError,
  ]);

  // Handle reset
  const handleReset = useCallback(() => {
    reset();
  }, [reset]);

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
          {appState === "loading" && (
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
          {appState === "error" && error && (
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
          {(appState === "idle" || appState === "ready") && (
            <>
              <UploadZone
                onFileSelect={handleFileSelect}
                selectedFile={file}
                onClear={handleClear}
                disabled={!ffmpegLoaded}
              />

              {appState === "ready" && file && videoUrl && (
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
                    videoUrl={videoUrl}
                    originalWidth={originalWidth}
                    topText={topText}
                    setTopText={setTopText}
                    bottomText={bottomText}
                    setBottomText={setBottomText}
                    onCropClick={() => setIsCropModalOpen(true)}
                  />

                  {/* Crop indicator */}
                  {cropArea && (
                    <div className='flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500/10 border border-purple-500/30 text-sm text-purple-700 dark:text-purple-300'>
                      <span>
                        ✂️ Crop active: {cropArea.width}×{cropArea.height} at (
                        {cropArea.x}, {cropArea.y})
                      </span>
                      <button
                        onClick={() => setCropArea(null)}
                        className='ml-auto text-xs hover:underline'>
                        Remove
                      </button>
                    </div>
                  )}

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
          {appState === "converting" && (
            <div className='space-y-6'>
              <ProgressDisplay progress={progress} status={statusMessage} />
              <div className='flex items-center justify-center gap-2 text-purple-600 dark:text-purple-400'>
                <Loader2 className='h-5 w-5 animate-spin' />
                <span className='text-sm font-medium'>
                  Processing in background — UI stays responsive!
                </span>
              </div>
            </div>
          )}

          {/* Done State */}
          {appState === "done" && gifUrl && (
            <ResultView gifUrl={gifUrl} gifSize={gifSize} onReset={handleReset} />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className='w-full px-6 py-4 text-center text-sm text-gray-600 dark:text-purple-300/50'>
        <p>Built with 💜 using FFmpeg.wasm • All processing happens in your browser</p>
      </footer>

      {/* Crop Modal */}
      {videoUrl && (
        <CropModal
          isOpen={isCropModalOpen}
          onClose={() => setIsCropModalOpen(false)}
          videoUrl={videoUrl}
          onCropComplete={handleCropComplete}
          initialCrop={cropArea}
        />
      )}
    </div>
  );
}
