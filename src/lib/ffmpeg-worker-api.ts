import type {
  WorkerMessage,
  WorkerResponse,
  ConvertOptions,
} from "@/workers/ffmpeg.worker";

export type { ConvertOptions };

export type ProgressCallback = (progress: number, status: string) => void;
export type LoadProgressCallback = (message: string) => void;

/**
 * FFmpeg Worker API
 * Provides a clean interface for communicating with the FFmpeg Web Worker
 */
export class FFmpegWorkerAPI {
  private worker: Worker | null = null;
  private isLoaded = false;

  /**
   * Create and initialize the worker
   */
  private createWorker(): Worker {
    if (this.worker) {
      return this.worker;
    }

    // Create worker using the worker file
    this.worker = new Worker(
      new URL("../workers/ffmpeg.worker.ts", import.meta.url),
      { type: "module" }
    );

    return this.worker;
  }

  /**
   * Load FFmpeg in the worker
   */
  async load(onProgress?: LoadProgressCallback): Promise<void> {
    if (this.isLoaded) {
      return;
    }

    const worker = this.createWorker();

    return new Promise((resolve, reject) => {
      const handleMessage = (event: MessageEvent<WorkerResponse>) => {
        const response = event.data;

        switch (response.type) {
          case "loadProgress":
            onProgress?.(response.message);
            break;

          case "loaded":
            this.isLoaded = true;
            worker.removeEventListener("message", handleMessage);
            resolve();
            break;

          case "error":
            worker.removeEventListener("message", handleMessage);
            reject(new Error(response.message));
            break;
        }
      };

      worker.addEventListener("message", handleMessage);

      const message: WorkerMessage = { type: "load" };
      worker.postMessage(message);
    });
  }

  /**
   * Convert video to GIF
   */
  async convert(
    file: File,
    options: ConvertOptions,
    onProgress?: ProgressCallback,
    textOverlayBlob?: Blob
  ): Promise<Blob> {
    if (!this.isLoaded) {
      throw new Error("FFmpeg is not loaded. Call load() first.");
    }

    const worker = this.worker;
    if (!worker) {
      throw new Error("Worker not initialized");
    }

    return new Promise((resolve, reject) => {
      const handleMessage = (event: MessageEvent<WorkerResponse>) => {
        const response = event.data;

        switch (response.type) {
          case "progress":
            onProgress?.(response.progress, response.status);
            break;

          case "done":
            worker.removeEventListener("message", handleMessage);
            resolve(response.gifBlob);
            break;

          case "error":
            worker.removeEventListener("message", handleMessage);
            reject(new Error(response.message));
            break;
        }
      };

      worker.addEventListener("message", handleMessage);

      const message: WorkerMessage = {
        type: "convert",
        file,
        options,
        textOverlayBlob,
      };
      worker.postMessage(message);
    });
  }

  /**
   * Check if FFmpeg is loaded
   */
  get loaded(): boolean {
    return this.isLoaded;
  }

  /**
   * Terminate the worker
   */
  terminate(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
      this.isLoaded = false;
    }
  }
}

// Singleton instance for app-wide use
let instance: FFmpegWorkerAPI | null = null;

export function getFFmpegWorker(): FFmpegWorkerAPI {
  if (!instance) {
    instance = new FFmpegWorkerAPI();
  }
  return instance;
}
