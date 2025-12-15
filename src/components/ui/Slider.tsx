'use client';

import React, { useRef, useState, useCallback } from 'react';
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
}: SliderProps) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState(0);

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
      }
    },
    [getValueFromPosition, orientation]
  );

  const handleMouseLeave = () => {
    setHoverValue(null);
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

      {/* Tooltip */}
      {showTooltip && formatTooltip && hoverValue !== null && !isVertical && (
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
