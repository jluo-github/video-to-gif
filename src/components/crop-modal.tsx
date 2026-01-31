"use client";

import { useState, useCallback } from "react";
import Cropper, { Area, Point } from "react-easy-crop";
import { X, Check, RotateCcw, Crop } from "lucide-react";

interface CropModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  onCropComplete: (cropArea: Area | null) => void;
  initialCrop?: Area | null;
}

export function CropModal({
  isOpen,
  onClose,
  videoUrl,
  onCropComplete,
  initialCrop,
}: CropModalProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(
    initialCrop || null,
  );

  const handleCropComplete = useCallback(
    (_croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    [],
  );

  const handleApply = useCallback(() => {
    onCropComplete(croppedAreaPixels);
    onClose();
  }, [croppedAreaPixels, onCropComplete, onClose]);

  const handleRemoveCrop = useCallback(() => {
    onCropComplete(null);
    onClose();
  }, [onCropComplete, onClose]);

  const handleReset = useCallback(() => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  }, []);

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      {/* Backdrop */}
      <div className='absolute inset-0 bg-black/80 backdrop-blur-sm' onClick={onClose} />

      {/* Modal */}
      <div className='relative w-full max-w-3xl mx-4 bg-gray-900 rounded-2xl shadow-2xl overflow-hidden'>
        {/* Header */}
        <div className='flex items-center justify-between px-6 py-4 border-b border-purple-500/20'>
          <div className='flex items-center gap-3'>
            <div className='h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/25'>
              <Crop className='h-5 w-5 text-white' />
            </div>
            <div>
              <h2 className='text-lg font-semibold text-purple-100'>Crop Video</h2>
              <p className='text-xs text-purple-300/60'>Drag to pan, scroll to zoom</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className='p-2 rounded-lg hover:bg-purple-500/10 transition-colors'>
            <X className='h-5 w-5 text-purple-300' />
          </button>
        </div>

        {/* Crop Area */}
        <div className='relative h-[450px] bg-black'>
          <Cropper
            video={videoUrl}
            crop={crop}
            zoom={zoom}
            aspect={4 / 3}
            objectFit='vertical-cover'
            showGrid={true}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={handleCropComplete}
            minZoom={1}
            maxZoom={3}
            zoomSpeed={0.1}
            restrictPosition={true}
            style={{
              containerStyle: {
                backgroundColor: "#000",
              },
              cropAreaStyle: {
                border: "2px solid rgba(168, 85, 247, 0.8)",
              },
            }}
          />
        </div>

        {/* Zoom Slider */}
        <div className='px-6 py-4 border-t border-purple-500/20'>
          <div className='flex items-center gap-4'>
            <span className='text-sm text-purple-300'>Zoom</span>
            <input
              type='range'
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className='flex-1 h-2 bg-purple-500/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500'
            />
            <span className='text-sm text-purple-400 font-mono w-12 text-right'>
              {zoom.toFixed(1)}x
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className='flex items-center justify-between px-6 py-4 border-t border-purple-500/20 bg-gray-900/50'>
          <div className='flex gap-2'>
            <button
              onClick={handleReset}
              className='flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 transition-colors'>
              <RotateCcw className='h-4 w-4' />
              Reset
            </button>
            {initialCrop && (
              <button
                onClick={handleRemoveCrop}
                className='flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors'>
                <X className='h-4 w-4' />
                Remove Crop
              </button>
            )}
          </div>
          <div className='flex gap-2'>
            <button
              onClick={onClose}
              className='px-4 py-2 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors'>
              Cancel
            </button>
            <button
              onClick={handleApply}
              className='flex items-center gap-2 px-6 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all'>
              <Check className='h-4 w-4' />
              Apply Crop
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
