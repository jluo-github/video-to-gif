"use client";

import * as Progress from "@radix-ui/react-progress";
import { Loader2, Sparkles } from "lucide-react";

interface ProgressDisplayProps {
  progress: number;
  status: string;
}

export function ProgressDisplay({ progress, status }: ProgressDisplayProps) {
  return (
    <div className='w-full p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl border border-purple-500/30 dark:border-purple-400/20'>
      <div className='flex items-center gap-3 mb-4'>
        <div className='h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/25'>
          {progress < 100 ? (
            <Loader2 className='h-5 w-5 text-white animate-spin' />
          ) : (
            <Sparkles className='h-5 w-5 text-white' />
          )}
        </div>
        <div className='flex-1'>
          <h2 className='text-lg font-semibold text-gray-900 dark:text-purple-100'>
            {progress < 100 ? "Converting..." : "Complete!"}
          </h2>
          <p className='text-sm text-gray-700 dark:text-purple-300/70'>{status}</p>
        </div>
        <span className='text-2xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent'>
          {Math.round(progress)}%
        </span>
      </div>

      <Progress.Root
        className='relative overflow-hidden bg-purple-500/20 rounded-full w-full h-4'
        value={progress}>
        <Progress.Indicator
          className='bg-gradient-to-r from-purple-500 via-pink-500 to-purple-400 w-full h-full transition-transform duration-300 ease-out rounded-full relative'
          style={{ transform: `translateX(-${100 - progress}%)` }}>
          {/* Shimmer effect */}
          <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer' />
        </Progress.Indicator>
      </Progress.Root>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}
