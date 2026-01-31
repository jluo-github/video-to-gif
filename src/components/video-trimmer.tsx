"use client";

import { useRef, useCallback, useState, useEffect } from "react";
import * as Slider from "@radix-ui/react-slider";
import { Play, Pause, RotateCcw } from "lucide-react";

interface VideoTrimmerProps {
  videoUrl: string;
  duration: number;
  startTime: number;
  endTime: number;
  onStartTimeChange: (time: number) => void;
  onEndTimeChange: (time: number) => void;
  disabled?: boolean;
}

// Format seconds to MM:SS.s
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toFixed(1).padStart(4, "0")}`;
}

export function VideoTrimmer({
  videoUrl,
  duration,
  startTime,
  endTime,
  onStartTimeChange,
  onEndTimeChange,
  disabled,
}: VideoTrimmerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const loopIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Seek video to a specific time
  const seekTo = useCallback((time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  }, []);

  // Handle slider value change (both thumbs)
  const handleValueChange = useCallback(
    (values: number[]) => {
      const [newStart, newEnd] = values;

      // Determine which thumb moved
      if (Math.abs(newStart - startTime) > 0.01) {
        onStartTimeChange(newStart);
        seekTo(newStart);
      } else if (Math.abs(newEnd - endTime) > 0.01) {
        onEndTimeChange(newEnd);
        seekTo(newEnd);
      }
    },
    [startTime, endTime, onStartTimeChange, onEndTimeChange, seekTo],
  );

  // Preview loop: play from start to end, then loop
  const startPreviewLoop = useCallback(() => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    video.currentTime = startTime;
    video.play();
    setIsPlaying(true);
    setIsLooping(true);

    // Check every 100ms if we've reached the end
    loopIntervalRef.current = setInterval(() => {
      if (video.currentTime >= endTime - 0.1) {
        video.currentTime = startTime;
      }
    }, 100);
  }, [startTime, endTime]);

  // Stop preview
  const stopPreview = useCallback(() => {
    if (!videoRef.current) return;

    videoRef.current.pause();
    setIsPlaying(false);
    setIsLooping(false);

    if (loopIntervalRef.current) {
      clearInterval(loopIntervalRef.current);
      loopIntervalRef.current = null;
    }
  }, []);

  // Toggle preview loop
  const togglePreviewLoop = useCallback(() => {
    if (isLooping) {
      stopPreview();
    } else {
      startPreviewLoop();
    }
  }, [isLooping, startPreviewLoop, stopPreview]);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (loopIntervalRef.current) {
        clearInterval(loopIntervalRef.current);
      }
    };
  }, []);

  // Stop loop if times change
  useEffect(() => {
    if (isLooping) {
      stopPreview();
    }
  }, [startTime, endTime]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset video to start time
  const resetToStart = useCallback(() => {
    stopPreview();
    seekTo(startTime);
  }, [stopPreview, seekTo, startTime]);

  return (
    <div className='space-y-4'>
      {/* Video Preview */}
      <div className='relative rounded-xl overflow-hidden bg-black/20 aspect-video'>
        <video
          ref={videoRef}
          src={videoUrl}
          className='w-full h-full object-contain'
          muted
          playsInline
          preload='metadata'
        />

        {/* Play/Pause overlay */}
        <div className='absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/20'>
          <button
            onClick={togglePreviewLoop}
            disabled={disabled}
            className='h-14 w-14 rounded-full bg-white/90 dark:bg-purple-900/90 flex items-center justify-center shadow-lg hover:scale-105 transition-transform disabled:opacity-50'>
            {isPlaying ? (
              <Pause className='h-6 w-6 text-purple-600 dark:text-purple-300' />
            ) : (
              <Play className='h-6 w-6 text-purple-600 dark:text-purple-300 ml-1' />
            )}
          </button>
        </div>
      </div>

      {/* Dual-Thumb Slider */}
      <div className='space-y-2'>
        <Slider.Root
          className='relative flex items-center select-none touch-none w-full h-6'
          value={[startTime, endTime]}
          onValueChange={handleValueChange}
          min={0}
          max={duration}
          step={0.1}
          minStepsBetweenThumbs={1}
          disabled={disabled}>
          <Slider.Track className='bg-purple-500/20 relative grow rounded-full h-3'>
            <Slider.Range className='absolute bg-gradient-to-r from-purple-500 to-pink-500 rounded-full h-full' />
          </Slider.Track>
          {/* Start Thumb */}
          <Slider.Thumb
            className='block w-6 h-6 bg-purple-500 shadow-lg shadow-purple-500/30 rounded-full hover:bg-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all hover:scale-110 cursor-grab active:cursor-grabbing'
            aria-label='Start time'
          />
          {/* End Thumb */}
          <Slider.Thumb
            className='block w-6 h-6 bg-pink-500 shadow-lg shadow-pink-500/30 rounded-full hover:bg-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 transition-all hover:scale-110 cursor-grab active:cursor-grabbing'
            aria-label='End time'
          />
        </Slider.Root>

        {/* Time Labels */}
        <div className='flex items-center justify-between text-xs'>
          <span className='font-mono text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2 py-1 rounded'>
            Start: {formatTime(startTime)}
          </span>
          <span className='text-gray-600 dark:text-purple-400/70'>
            Duration: {formatTime(endTime - startTime)}
          </span>
          <span className='font-mono text-pink-600 dark:text-pink-400 bg-pink-500/10 px-2 py-1 rounded'>
            End: {formatTime(endTime)}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className='flex items-center gap-2'>
        <button
          onClick={togglePreviewLoop}
          disabled={disabled}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
            isLooping
              ? "bg-purple-500 text-white shadow-lg shadow-purple-500/30"
              : "bg-purple-500/10 text-purple-700 dark:text-purple-300 hover:bg-purple-500/20"
          } disabled:opacity-50`}>
          {isLooping ? (
            <>
              <Pause className='h-4 w-4' />
              Stop Preview
            </>
          ) : (
            <>
              <Play className='h-4 w-4' />
              Preview Loop
            </>
          )}
        </button>
        <button
          onClick={resetToStart}
          disabled={disabled}
          className='px-4 py-2 rounded-lg bg-purple-500/10 text-purple-700 dark:text-purple-300 hover:bg-purple-500/20 transition-colors disabled:opacity-50'
          title='Reset to start'>
          <RotateCcw className='h-4 w-4' />
        </button>
      </div>
    </div>
  );
}
