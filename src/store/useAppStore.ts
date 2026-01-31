"use client";

import { create } from "zustand";

// Crop area coordinates
export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

// App states
export type AppState =
  | "idle"
  | "loading"
  | "ready"
  | "converting"
  | "done"
  | "error";

// Store interface
interface AppStore {
  // App state
  appState: AppState;
  ffmpegLoaded: boolean;
  loadingMessage: string;
  error: string | null;

  // File state
  file: File | null;
  videoUrl: string | null;
  videoDuration: number;
  originalWidth: number;
  originalHeight: number;

  // Settings
  fps: number;
  width: number;
  startTime: number;
  endTime: number;

  // Crop settings
  cropEnabled: boolean;
  cropArea: CropArea | null;

  // Text overlay
  topText: string;
  bottomText: string;

  // Progress & result
  progress: number;
  statusMessage: string;
  gifUrl: string | null;
  gifSize: number;

  // Actions - App state
  setAppState: (state: AppState) => void;
  setFfmpegLoaded: (loaded: boolean) => void;
  setLoadingMessage: (message: string) => void;
  setError: (error: string | null) => void;

  // Actions - File
  setFile: (file: File | null) => void;
  setVideoDuration: (duration: number) => void;
  setVideoMetadata: (metadata: {
    duration: number;
    width: number;
    height: number;
  }) => void;

  // Actions - Settings
  setFps: (fps: number) => void;
  setWidth: (width: number) => void;
  setStartTime: (time: number) => void;
  setEndTime: (time: number) => void;
  applyPreset: (preset: { width: number | "original"; fps: number }) => void;

  // Actions - Crop
  setCropEnabled: (enabled: boolean) => void;
  setCropArea: (area: CropArea | null) => void;

  // Actions - Text
  setTopText: (text: string) => void;
  setBottomText: (text: string) => void;

  // Actions - Progress & Result
  setProgress: (progress: number, statusMessage?: string) => void;
  setResult: (url: string, size: number) => void;

  // Actions - Reset
  reset: () => void;
  clearFile: () => void;
}

// Initial state values
const initialState = {
  appState: "idle" as AppState,
  ffmpegLoaded: false,
  loadingMessage: "",
  error: null,

  file: null,
  videoUrl: null,
  videoDuration: 0,
  originalWidth: 0,
  originalHeight: 0,

  fps: 15,
  width: 480,
  startTime: 0,
  endTime: 10,

  cropEnabled: false,
  cropArea: null,

  topText: "",
  bottomText: "",

  progress: 0,
  statusMessage: "",
  gifUrl: null,
  gifSize: 0,
};

export const useAppStore = create<AppStore>((set, get) => ({
  ...initialState,

  // App state actions
  setAppState: (appState) => set({ appState }),
  setFfmpegLoaded: (ffmpegLoaded) => set({ ffmpegLoaded }),
  setLoadingMessage: (loadingMessage) => set({ loadingMessage }),
  setError: (error) =>
    set({ error, appState: error ? "error" : get().appState }),

  // File actions
  setFile: (file) => {
    const currentUrl = get().videoUrl;
    if (currentUrl) {
      URL.revokeObjectURL(currentUrl);
    }

    if (file) {
      const videoUrl = URL.createObjectURL(file);
      set({
        file,
        videoUrl,
        error: null,
      });
    } else {
      set({
        file: null,
        videoUrl: null,
        videoDuration: 0,
        originalWidth: 0,
        originalHeight: 0,
        startTime: 0,
        endTime: 10,
      });
    }
  },

  setVideoDuration: (duration) => {
    set({
      videoDuration: duration,
      startTime: 0,
      endTime: Math.min(duration, 10),
      appState: "ready",
    });
  },

  setVideoMetadata: ({ duration, width, height }) => {
    set({
      videoDuration: duration,
      originalWidth: width,
      originalHeight: height,
      startTime: 0,
      endTime: Math.min(duration, 10),
      appState: "ready",
    });
  },

  // Settings actions
  setFps: (fps) => set({ fps }),
  setWidth: (width) => set({ width }),
  setStartTime: (startTime) => set({ startTime }),
  setEndTime: (endTime) => set({ endTime }),

  applyPreset: (preset) => {
    const { originalWidth } = get();
    set({
      fps: preset.fps,
      width: preset.width === "original" ? originalWidth || 480 : preset.width,
    });
  },

  // Crop actions
  setCropEnabled: (cropEnabled) => set({ cropEnabled }),
  setCropArea: (cropArea) => set({ cropArea, cropEnabled: cropArea !== null }),

  // Text actions
  setTopText: (topText) => set({ topText }),
  setBottomText: (bottomText) => set({ bottomText }),

  // Progress & Result actions
  setProgress: (progress, statusMessage) =>
    set((state) => ({
      progress,
      statusMessage: statusMessage ?? state.statusMessage,
    })),

  setResult: (gifUrl, gifSize) => {
    const currentGifUrl = get().gifUrl;
    if (currentGifUrl) {
      URL.revokeObjectURL(currentGifUrl);
    }
    set({
      gifUrl,
      gifSize,
      progress: 100,
      statusMessage: "GIF created successfully!",
      appState: "done",
    });
  },

  // Reset actions
  reset: () => {
    const { videoUrl, gifUrl } = get();
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    if (gifUrl) URL.revokeObjectURL(gifUrl);
    set(initialState);
  },

  clearFile: () => {
    const { videoUrl, gifUrl } = get();
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    if (gifUrl) URL.revokeObjectURL(gifUrl);
    set({
      file: null,
      videoUrl: null,
      videoDuration: 0,
      originalWidth: 0,
      originalHeight: 0,
      startTime: 0,
      endTime: 10,
      gifUrl: null,
      gifSize: 0,
      appState: "idle",
      error: null,
      cropEnabled: false,
      cropArea: null,
      topText: "",
      bottomText: "",
    });
  },
}));
