"use client";

import { Download, RotateCcw, Sparkles, Image as ImageIcon } from "lucide-react";
import { formatFileSize } from "@/lib/utils";

interface ResultViewProps {
  gifUrl: string;
  gifSize: number;
  onReset: () => void;
}

export function ResultView({ gifUrl, gifSize, onReset }: ResultViewProps) {
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = gifUrl;
    link.download = `converted-${Date.now()}.gif`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className='w-full space-y-6'>
      {/* Success Banner */}
      <div className='p-4 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 flex items-center gap-3'>
        <div className='h-10 w-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/25'>
          <Sparkles className='h-5 w-5 text-white' />
        </div>
        <div className='flex-1'>
          <p className='font-semibold text-green-800 dark:text-green-200'>
            GIF Created Successfully!
          </p>
          <p className='text-sm text-green-700 dark:text-green-300/70'>
            Your video has been converted to a GIF
          </p>
        </div>
      </div>

      {/* GIF Preview */}
      <div className='relative rounded-2xl overflow-hidden bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl border border-purple-500/30 dark:border-purple-400/20'>
        <div className='absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm'>
          <ImageIcon className='h-4 w-4 text-white' />
          <span className='text-sm text-white font-medium'>
            {formatFileSize(gifSize)}
          </span>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={gifUrl}
          alt='Converted GIF'
          className='w-full max-h-[500px] object-contain'
        />
      </div>

      {/* Action Buttons */}
      <div className='flex gap-4'>
        <button
          onClick={handleDownload}
          className='flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold text-lg shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-[1.02] transition-all duration-300'>
          <Download className='h-6 w-6' />
          Download GIF
        </button>
        <button
          onClick={onReset}
          className='flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-purple-500/10 border border-purple-500/30 text-gray-800 dark:text-purple-300 font-medium hover:bg-purple-500/20 hover:border-purple-500/50 transition-all duration-300'>
          <RotateCcw className='h-5 w-5' />
          New
        </button>
      </div>
    </div>
  );
}
