'use client';

import React from 'react';
import { cn } from '@/utils/helpers';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'ghost' | 'outline' | 'primary';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  children: React.ReactNode;
}

export function Button({
  variant = 'default',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium transition-all',
        'focus:outline-none focus:ring-2 focus:ring-primary-500/50',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        // Variants
        variant === 'default' && 'bg-white/10 hover:bg-white/20 text-white',
        variant === 'ghost' && 'hover:bg-white/10 text-white',
        variant === 'outline' && 'border border-white/20 hover:bg-white/10 text-white',
        variant === 'primary' && 'bg-primary-500 hover:bg-primary-600 text-white',
        // Sizes
        size === 'sm' && 'px-3 py-1.5 text-sm',
        size === 'md' && 'px-4 py-2',
        size === 'lg' && 'px-6 py-3 text-lg',
        size === 'icon' && 'w-10 h-10',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
