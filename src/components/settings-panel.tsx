"use client";

import * as Slider from "@radix-ui/react-slider";
import { Settings, Gauge, Maximize, Zap, Type, MessageSquare } from "lucide-react";
import { VideoTrimmer } from "./video-trimmer";

// Preset configurations
const PRESETS = [
  {
    id: "discord",
    name: "Discord Sticker",
    icon: "🎮",
    width: 320,
    fps: 15,
    description: "Perfect for Discord",
  },
  {
    id: "hq",
    name: "High Quality",
    icon: "✨",
    width: "original" as const,
    fps: 30,
    description: "Maximum quality",
  },
  {
    id: "email",
    name: "Email Friendly",
    icon: "📧",
    width: 480,
    fps: 10,
    description: "Small file size",
  },
];

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
  // Optional: for presets and text overlay
  videoUrl?: string;
  originalWidth?: number;
  topText?: string;
  setTopText?: (text: string) => void;
  bottomText?: string;
  setBottomText?: (text: string) => void;
  onCropClick?: () => void;
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
  videoUrl,
  originalWidth,
  topText = "",
  setTopText,
  bottomText = "",
  setBottomText,
  onCropClick,
}: SettingsPanelProps) {
  // Apply preset
  const applyPreset = (preset: (typeof PRESETS)[number]) => {
    setFps(preset.fps);
    if (preset.width === "original") {
      setWidth(originalWidth || 480);
    } else {
      setWidth(preset.width);
    }
  };

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
        {/* One-Click Presets */}
        <div className='space-y-3'>
          <div className='flex items-center gap-2'>
            <Zap className='h-4 w-4 text-purple-500 dark:text-purple-400' />
            <span className='text-sm font-medium text-gray-800 dark:text-purple-100'>
              Quick Presets
            </span>
          </div>
          <div className='grid grid-cols-3 gap-2'>
            {PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => applyPreset(preset)}
                disabled={disabled}
                className='flex flex-col items-center gap-1 p-3 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 hover:border-purple-500/40 transition-all disabled:opacity-50 group'>
                <span className='text-2xl group-hover:scale-110 transition-transform'>
                  {preset.icon}
                </span>
                <span className='text-xs font-medium text-gray-800 dark:text-purple-200'>
                  {preset.name}
                </span>
                <span className='text-[10px] text-gray-600 dark:text-purple-400/70'>
                  {preset.description}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Visual Trimmer */}
        {videoUrl && (
          <div className='space-y-3'>
            <VideoTrimmer
              videoUrl={videoUrl}
              duration={maxDuration}
              startTime={startTime}
              endTime={endTime}
              onStartTimeChange={setStartTime}
              onEndTimeChange={setEndTime}
              disabled={disabled}
            />
          </div>
        )}

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

        {/* Text Overlay Section */}
        {setTopText && setBottomText && (
          <div className='space-y-3 pt-4 border-t border-purple-500/20'>
            <div className='flex items-center gap-2'>
              <Type className='h-4 w-4 text-purple-500 dark:text-purple-400' />
              <span className='text-sm font-medium text-gray-800 dark:text-purple-100'>
                Text Overlay (Meme Mode)
              </span>
              <span className='text-[10px] px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-600 dark:text-pink-400 font-medium'>
                NEW
              </span>
            </div>
            <div className='space-y-2'>
              <div>
                <label className='text-xs text-gray-700 dark:text-purple-400/70 block mb-1'>
                  Top Text
                </label>
                <div className='relative'>
                  <MessageSquare className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-400' />
                  <input
                    type='text'
                    value={topText}
                    onChange={(e) => setTopText(e.target.value)}
                    placeholder='WHEN YOU...'
                    disabled={disabled}
                    className='w-full pl-10 pr-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-gray-900 dark:text-purple-100 placeholder:text-purple-400/50 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50'
                  />
                </div>
              </div>
              <div>
                <label className='text-xs text-gray-700 dark:text-purple-400/70 block mb-1'>
                  Bottom Text
                </label>
                <div className='relative'>
                  <MessageSquare className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-400' />
                  <input
                    type='text'
                    value={bottomText}
                    onChange={(e) => setBottomText(e.target.value)}
                    placeholder='...BOTTOM TEXT'
                    disabled={disabled}
                    className='w-full pl-10 pr-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-gray-900 dark:text-purple-100 placeholder:text-purple-400/50 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50'
                  />
                </div>
              </div>
              <p className='text-[10px] text-gray-600 dark:text-purple-400/60 italic'>
                Text will appear in classic meme style with white text and black outline
              </p>
            </div>
          </div>
        )}

        {/* Crop Button */}
        {onCropClick && (
          <button
            onClick={onCropClick}
            disabled={disabled}
            className='w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-purple-500/10 text-purple-700 dark:text-purple-300 hover:bg-purple-500/20 border border-purple-500/20 hover:border-purple-500/40 transition-all disabled:opacity-50'>
            <Maximize className='h-4 w-4' />
            Crop Video
          </button>
        )}
      </div>
    </div>
  );
}
