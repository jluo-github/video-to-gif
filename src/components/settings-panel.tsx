"use client";

import * as Slider from "@radix-ui/react-slider";
import { Settings, Gauge, Maximize, Timer } from "lucide-react";

interface SettingsPanelProps {
  fps: number;
  setFps: (fps: number) => void;
  width: number;
  setWidth: (width: number) => void;
  startTime: number;
  setStartTime: (time: number) => void;
  endTime: number;
  setEndTime: (time: number) => void;
  maxDuration: number;
  disabled?: boolean;
}

export function SettingsPanel({
  fps,
  setFps,
  width,
  setWidth,
  startTime,
  setStartTime,
  endTime,
  setEndTime,
  maxDuration,
  disabled,
}: SettingsPanelProps) {
  return (
    <div className='w-full p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl border border-purple-500/30 dark:border-purple-400/20'>
      <div className='flex items-center gap-3 mb-6'>
        <div className='h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/25'>
          <Settings className='h-5 w-5 text-white' />
        </div>
        <h2 className='text-lg font-semibold text-gray-900 dark:text-purple-100'>
          Conversion Settings
        </h2>
      </div>

      <div className='space-y-6'>
        {/* FPS Slider */}
        <div className='space-y-3'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Gauge className='h-4 w-4 text-purple-500 dark:text-purple-400' />
              <span className='text-sm font-medium text-gray-800 dark:text-purple-100'>
                Frame Rate
              </span>
            </div>
            <span className='text-sm font-mono text-gray-800 dark:text-purple-300 bg-purple-500/10 px-2 py-1 rounded'>
              {fps} FPS
            </span>
          </div>
          <Slider.Root
            className='relative flex items-center select-none touch-none w-full h-5'
            value={[fps]}
            onValueChange={([v]) => setFps(v)}
            min={5}
            max={30}
            step={1}
            disabled={disabled}>
            <Slider.Track className='bg-purple-500/20 relative grow rounded-full h-2'>
              <Slider.Range className='absolute bg-gradient-to-r from-purple-500 to-pink-500 rounded-full h-full' />
            </Slider.Track>
            <Slider.Thumb className='block w-5 h-5 bg-white dark:bg-purple-100 shadow-lg shadow-purple-500/30 rounded-full hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-transform hover:scale-110' />
          </Slider.Root>
          <div className='flex justify-between text-xs text-gray-600 dark:text-purple-400/70'>
            <span>5</span>
            <span>30</span>
          </div>
        </div>

        {/* Width Slider */}
        <div className='space-y-3'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Maximize className='h-4 w-4 text-purple-500 dark:text-purple-400' />
              <span className='text-sm font-medium text-gray-800 dark:text-purple-100'>
                Output Width
              </span>
            </div>
            <span className='text-sm font-mono text-gray-800 dark:text-purple-300 bg-purple-500/10 px-2 py-1 rounded'>
              {width}px
            </span>
          </div>
          <Slider.Root
            className='relative flex items-center select-none touch-none w-full h-5'
            value={[width]}
            onValueChange={([v]) => setWidth(v)}
            min={240}
            max={1280}
            step={40}
            disabled={disabled}>
            <Slider.Track className='bg-purple-500/20 relative grow rounded-full h-2'>
              <Slider.Range className='absolute bg-gradient-to-r from-purple-500 to-pink-500 rounded-full h-full' />
            </Slider.Track>
            <Slider.Thumb className='block w-5 h-5 bg-white dark:bg-purple-100 shadow-lg shadow-purple-500/30 rounded-full hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-transform hover:scale-110' />
          </Slider.Root>
          <div className='flex justify-between text-xs text-gray-600 dark:text-purple-400/70'>
            <span>240px</span>
            <span>1280px</span>
          </div>
        </div>

        {/* Duration Trim */}
        <div className='space-y-3'>
          <div className='flex items-center gap-2'>
            <Timer className='h-4 w-4 text-purple-500 dark:text-purple-400' />
            <span className='text-sm font-medium text-gray-800 dark:text-purple-100'>
              Trim Duration
            </span>
          </div>
          <div className='flex gap-4'>
            <div className='flex-1'>
              <label className='text-xs text-gray-700 dark:text-purple-400/70 block mb-1'>
                Start (seconds)
              </label>
              <input
                type='number'
                min={0}
                max={Math.max(0, endTime - 0.1)}
                step={0.1}
                value={startTime}
                onChange={(e) =>
                  setStartTime(Math.max(0, parseFloat(e.target.value) || 0))
                }
                disabled={disabled}
                className='w-full px-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-gray-900 dark:text-purple-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50'
              />
            </div>
            <div className='flex-1'>
              <label className='text-xs text-gray-700 dark:text-purple-400/70 block mb-1'>
                End (seconds)
              </label>
              <input
                type='number'
                min={startTime + 0.1}
                max={maxDuration}
                step={0.1}
                value={endTime}
                onChange={(e) =>
                  setEndTime(
                    Math.min(maxDuration, parseFloat(e.target.value) || maxDuration)
                  )
                }
                disabled={disabled}
                className='w-full px-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-gray-900 dark:text-purple-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50'
              />
            </div>
          </div>
          <p className='text-xs text-gray-600 dark:text-purple-400/70'>
            Duration: {(endTime - startTime).toFixed(1)}s of {maxDuration.toFixed(1)}s
          </p>
        </div>
      </div>
    </div>
  );
}
