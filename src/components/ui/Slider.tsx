'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { cn } from '@/utils/helpers';

interface SliderProps {
  value: number;
  max?: number;
  min?: number;
  step?: number;
  onChange: (value: number) => void;
  onChangeStart?: () => void;
  onChangeEnd?: () => void;
  className?: string;
  trackClassName?: string;
  fillClassName?: string;
  thumbClassName?: string;
  showThumb?: boolean;
  buffered?: number;
  formatTooltip?: (value: number) => string;
  showTooltip?: boolean;
  orientation?: 'horizontal' | 'vertical';
  videoRef?: React.RefObject<HTMLVideoElement | null>;
  showThumbnail?: boolean;
}

export function Slider({
  value,
  max = 100,
  min = 0,
  onChange,
  onChangeStart,
  onChangeEnd,
  className,
  trackClassName,
  fillClassName,
  thumbClassName,
  showThumb = true,
  buffered,
  formatTooltip,
  showTooltip = false,
  orientation = 'horizontal',
  videoRef,
  showThumbnail = false,
}: SliderProps) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState(0);

  // Thumbnail preview state
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const thumbnailVideoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastThumbnailTime = useRef<number>(-1);

  // Initialize hidden video element for thumbnail generation
  useEffect(() => {
    if (!showThumbnail || !videoRef?.current) return;

    // Create hidden video element
    const thumbVideo = document.createElement('video');
    thumbVideo.crossOrigin = 'anonymous';
    thumbVideo.muted = true;
    thumbVideo.preload = 'metadata';
    thumbnailVideoRef.current = thumbVideo;

    // Create canvas for drawing thumbnails
    const canvas = document.createElement('canvas');
    canvas.width = 160;
    canvas.height = 90;
    canvasRef.current = canvas;

    // Set the same source as the main video
    if (videoRef.current.src) {
      thumbVideo.src = videoRef.current.src;
    }

    // Generate thumbnail when seeked
    thumbVideo.addEventListener('seeked', () => {
      if (!canvasRef.current || !thumbnailVideoRef.current) return;
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(thumbnailVideoRef.current, 0, 0, 160, 90);
      setThumbnailUrl(canvasRef.current.toDataURL('image/jpeg', 0.7));
    });

    return () => {
      if (thumbnailVideoRef.current) {
        thumbnailVideoRef.current.src = '';
        thumbnailVideoRef.current = null;
      }
      canvasRef.current = null;
    };
  }, [showThumbnail, videoRef]);

  // Update thumbnail video source when main video source changes
  useEffect(() => {
    if (!showThumbnail || !videoRef?.current || !thumbnailVideoRef.current) return;

    if (videoRef.current.src && thumbnailVideoRef.current.src !== videoRef.current.src) {
      thumbnailVideoRef.current.src = videoRef.current.src;
    }
  }, [showThumbnail, videoRef]);

  // Generate thumbnail at hover position
  const generateThumbnail = useCallback((time: number) => {
    if (!thumbnailVideoRef.current || !showThumbnail) return;

    // Only generate if time changed significantly (0.5 second threshold)
    if (Math.abs(time - lastThumbnailTime.current) < 0.5) return;

    lastThumbnailTime.current = time;
    thumbnailVideoRef.current.currentTime = time;
  }, [showThumbnail]);

  const percentage = ((value - min) / (max - min)) * 100;
  const bufferedPercentage = buffered ? ((buffered - min) / (max - min)) * 100 : 0;

  const getValueFromPosition = useCallback(
    (clientX: number, clientY: number) => {
      if (!sliderRef.current) return value;

      const rect = sliderRef.current.getBoundingClientRect();
      let percent: number;

      if (orientation === 'vertical') {
        percent = 1 - (clientY - rect.top) / rect.height;
      } else {
        percent = (clientX - rect.left) / rect.width;
      }

      percent = Math.max(0, Math.min(1, percent));
      return min + percent * (max - min);
    },
    [min, max, value, orientation]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(true);
      onChangeStart?.();

      const newValue = getValueFromPosition(e.clientX, e.clientY);
      onChange(newValue);

      const handleMouseMove = (e: MouseEvent) => {
        const newValue = getValueFromPosition(e.clientX, e.clientY);
        onChange(newValue);
      };

      const handleMouseUp = () => {
        setIsDragging(false);
        onChangeEnd?.();
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [getValueFromPosition, onChange, onChangeStart, onChangeEnd]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!sliderRef.current) return;

      const rect = sliderRef.current.getBoundingClientRect();
      const newValue = getValueFromPosition(e.clientX, e.clientY);
      setHoverValue(newValue);

      if (orientation === 'horizontal') {
        setTooltipPosition(e.clientX - rect.left);

        // Generate thumbnail at hover position
        if (showThumbnail) {
          generateThumbnail(newValue);
        }
      }
    },
    [getValueFromPosition, orientation, showThumbnail, generateThumbnail]
  );

  const handleMouseLeave = () => {
    setHoverValue(null);
    setThumbnailUrl(null);
    lastThumbnailTime.current = -1;
  };

  const isVertical = orientation === 'vertical';

  return (
    <div
      ref={sliderRef}
      className={cn(
        'relative cursor-pointer group',
        isVertical ? 'h-full w-2' : 'w-full h-2',
        className
      )}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Track */}
      <div
        className={cn(
          'absolute rounded-full bg-white/20 transition-all',
          isVertical ? 'w-full h-full' : 'h-full w-full',
          'group-hover:scale-y-125',
          trackClassName
        )}
      />

      {/* Buffered */}
      {buffered !== undefined && !isVertical && (
        <div
          className="absolute h-full rounded-full bg-white/30 transition-all"
          style={{ width: `${bufferedPercentage}%` }}
        />
      )}

      {/* Fill */}
      <div
        className={cn(
          'absolute rounded-full bg-primary-500 transition-all',
          isVertical ? 'w-full bottom-0' : 'h-full left-0',
          fillClassName
        )}
        style={
          isVertical ? { height: `${percentage}%` } : { width: `${percentage}%` }
        }
      />

      {/* Thumb */}
      {showThumb && (
        <div
          className={cn(
            'absolute w-4 h-4 rounded-full bg-white shadow-lg',
            'transform -translate-x-1/2 -translate-y-1/2',
            'opacity-0 group-hover:opacity-100 transition-opacity',
            'ring-2 ring-primary-500/50',
            isDragging && 'opacity-100 scale-110',
            thumbClassName
          )}
          style={
            isVertical
              ? { bottom: `${percentage}%`, left: '50%', transform: 'translate(-50%, 50%)' }
              : { left: `${percentage}%`, top: '50%' }
          }
        />
      )}

      {/* Thumbnail Preview */}
      {showThumbnail && thumbnailUrl && hoverValue !== null && !isVertical && (
        <div
          className="absolute bottom-full mb-2 flex flex-col items-center transform -translate-x-1/2 pointer-events-none"
          style={{ left: tooltipPosition }}
        >
          <div className="rounded-lg overflow-hidden border-2 border-primary-500 shadow-lg shadow-black/50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={thumbnailUrl}
              alt="Preview"
              className="w-40 h-[90px] object-cover"
            />
          </div>
          {formatTooltip && (
            <div className="mt-1 px-2 py-1 text-xs bg-black/90 text-white rounded whitespace-nowrap">
              {formatTooltip(hoverValue)}
            </div>
          )}
        </div>
      )}

      {/* Tooltip (only show if thumbnail is not shown) */}
      {showTooltip && formatTooltip && hoverValue !== null && !isVertical && !showThumbnail && (
        <div
          className="absolute bottom-full mb-2 px-2 py-1 text-xs bg-black/90 text-white rounded whitespace-nowrap transform -translate-x-1/2 pointer-events-none"
          style={{ left: tooltipPosition }}
        >
          {formatTooltip(hoverValue)}
        </div>
      )}
    </div>
  );
}
