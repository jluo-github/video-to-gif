"use client";

import { useCallback, useState } from "react";
import { Upload, Film, X } from "lucide-react";
import { cn, formatFileSize } from "@/lib/utils";

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onClear: () => void;
  disabled?: boolean;
}

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export function UploadZone({
  onFileSelect,
  selectedFile,
  onClear,
  disabled,
}: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = useCallback((file: File): boolean => {
    setError(null);

    const validTypes = ["video/mp4", "video/quicktime", "video/webm"];
    if (!validTypes.includes(file.type)) {
      setError("Please upload an MP4, MOV, or WebM file");
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError(`File too large. Maximum size is ${formatFileSize(MAX_FILE_SIZE)}`);
      return false;
    }

    return true;
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      if (disabled) return;

      const file = e.dataTransfer.files[0];
      if (file && validateFile(file)) {
        onFileSelect(file);
      }
    },
    [disabled, onFileSelect, validateFile]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && validateFile(file)) {
        onFileSelect(file);
      }
    },
    [onFileSelect, validateFile]
  );

  if (selectedFile) {
    return (
      <div className='relative w-full p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl border border-purple-500/30 dark:border-purple-400/20'>
        <div className='flex items-center gap-4'>
          <div className='h-14 w-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/25'>
            <Film className='h-7 w-7 text-white' />
          </div>
          <div className='flex-1 min-w-0'>
            <p className='font-semibold text-gray-900 dark:text-purple-100 truncate'>
              {selectedFile.name}
            </p>
            <p className='text-sm text-gray-700 dark:text-purple-300/70'>
              {formatFileSize(selectedFile.size)}
            </p>
          </div>
          <button
            onClick={onClear}
            disabled={disabled}
            className={cn(
              "h-10 w-10 rounded-full flex items-center justify-center transition-all duration-200",
              "bg-red-500/10 hover:bg-red-500/20 text-red-500 dark:text-red-400",
              "border border-red-500/20 hover:border-red-500/40",
              disabled && "opacity-50 cursor-not-allowed"
            )}>
            <X className='h-5 w-5' />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={cn(
        "relative w-full p-12 rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer group",
        "bg-gradient-to-br from-purple-500/5 to-pink-500/5 backdrop-blur-xl",
        isDragging
          ? "border-purple-400 bg-purple-500/10 scale-[1.02]"
          : "border-purple-500/30 dark:border-purple-400/20 hover:border-purple-400/50",
        disabled && "opacity-50 cursor-not-allowed"
      )}>
      <input
        type='file'
        accept='video/mp4,video/quicktime,video/webm'
        onChange={handleFileInput}
        disabled={disabled}
        className='absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed'
      />

      <div className='flex flex-col items-center gap-4 text-center pointer-events-none'>
        <div
          className={cn(
            "h-20 w-20 rounded-2xl flex items-center justify-center transition-all duration-300",
            "bg-gradient-to-br from-purple-500/20 to-pink-500/20",
            "border border-purple-500/30 dark:border-purple-400/20",
            "group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-purple-500/25",
            isDragging && "scale-110 shadow-lg shadow-purple-500/25"
          )}>
          <Upload
            className={cn(
              "h-10 w-10 text-purple-500 dark:text-purple-400 transition-transform duration-300",
              isDragging && "-translate-y-1"
            )}
          />
        </div>

        <div>
          <p className='text-lg font-semibold text-gray-900 dark:text-purple-100'>
            Drop your video here
          </p>
          <p className='text-sm text-gray-700 dark:text-purple-300/70 mt-1'>
            or click to browse • MP4, MOV, WebM up to 100MB
          </p>
        </div>

        {error && (
          <div className='px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-sm'>
            {error}
          </div>
        )}
      </div>

      {/* Glow effect */}
      <div
        className={cn(
          "absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 pointer-events-none",
          "bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-purple-500/20",
          (isDragging || false) && "opacity-100"
        )}
      />
    </div>
  );
}
