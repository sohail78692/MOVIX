'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Power, RotateCcw } from 'lucide-react';
import { usePlayerStore, eqPresets } from '@/stores/playerStore';
import { Modal } from '@/components/ui/Modal';
import { cn } from '@/utils/helpers';

const EQ_FREQUENCIES = ['32', '64', '125', '250', '500', '1K', '2K', '4K', '8K', '16K'];

export function EqualizerModal() {
  const {
    showEqualizer,
    setShowEqualizer,
    equalizer,
    setEqualizerEnabled,
    setEqualizerBand,
    setEqualizerPreamp,
    setEqualizerPreset,
    resetEqualizer,
  } = usePlayerStore();

  return (
    <Modal
      isOpen={showEqualizer}
      onClose={() => setShowEqualizer(false)}
      title="Equalizer"
      size="xl"
    >
      <div className="space-y-6">
        {/* Header Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Power Toggle */}
            <button
              onClick={() => setEqualizerEnabled(!equalizer.enabled)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
                equalizer.enabled
                  ? 'bg-primary-500 text-white'
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              )}
            >
              <Power className="w-4 h-4" />
              {equalizer.enabled ? 'On' : 'Off'}
            </button>

            {/* Reset Button */}
            <button
              onClick={resetEqualizer}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10
                         text-white/60 hover:bg-white/20 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          </div>

          {/* Preset Selector */}
          <select
            value={equalizer.preset}
            onChange={(e) => setEqualizerPreset(e.target.value)}
            className="bg-white/10 border border-white/10 rounded-lg px-4 py-2
                       text-white text-sm focus:outline-none focus:border-primary-500"
          >
            {Object.entries(eqPresets).map(([key, preset]) => (
              <option key={key} value={key} className="bg-dark-900">
                {preset.name}
              </option>
            ))}
            {equalizer.preset === 'custom' && (
              <option value="custom" className="bg-dark-900">Custom</option>
            )}
          </select>
        </div>

        {/* Preamp + Band Sliders */}
        <div className={cn(
          'transition-opacity',
          !equalizer.enabled && 'opacity-50 pointer-events-none'
        )}>
          <div className="flex gap-4">
            {/* Preamp */}
            <div className="flex flex-col items-center">
              <span className="text-xs text-white/40 mb-2">Pre</span>
              <div className="relative h-40 w-8 flex items-center justify-center">
                <input
                  type="range"
                  min="-12"
                  max="12"
                  step="1"
                  value={equalizer.preamp}
                  onChange={(e) => setEqualizerPreamp(Number(e.target.value))}
                  className="absolute h-32 w-2 appearance-none bg-white/20 rounded-full cursor-pointer
                             [writing-mode:vertical-lr] [direction:rtl]
                             [&::-webkit-slider-thumb]:appearance-none
                             [&::-webkit-slider-thumb]:w-4
                             [&::-webkit-slider-thumb]:h-4
                             [&::-webkit-slider-thumb]:rounded-full
                             [&::-webkit-slider-thumb]:bg-primary-500
                             [&::-webkit-slider-thumb]:cursor-pointer
                             [&::-webkit-slider-thumb]:shadow-lg"
                />
              </div>
              <span className={cn(
                'text-xs font-mono mt-2',
                equalizer.preamp > 0 ? 'text-green-400' : equalizer.preamp < 0 ? 'text-red-400' : 'text-white/60'
              )}>
                {equalizer.preamp > 0 ? '+' : ''}{equalizer.preamp}
              </span>
            </div>

            {/* Divider */}
            <div className="w-px bg-white/10 mx-2" />

            {/* Band Sliders */}
            {equalizer.bands.map((gain, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <span className="text-xs text-white/40 mb-2">{EQ_FREQUENCIES[index]}</span>
                <div className="relative h-40 w-full flex items-center justify-center">
                  <input
                    type="range"
                    min="-12"
                    max="12"
                    step="1"
                    value={gain}
                    onChange={(e) => setEqualizerBand(index, Number(e.target.value))}
                    className="absolute h-32 w-2 appearance-none bg-white/20 rounded-full cursor-pointer
                               [writing-mode:vertical-lr] [direction:rtl]
                               [&::-webkit-slider-thumb]:appearance-none
                               [&::-webkit-slider-thumb]:w-4
                               [&::-webkit-slider-thumb]:h-4
                               [&::-webkit-slider-thumb]:rounded-full
                               [&::-webkit-slider-thumb]:bg-primary-500
                               [&::-webkit-slider-thumb]:cursor-pointer
                               [&::-webkit-slider-thumb]:shadow-lg"
                  />
                  {/* Visual bar */}
                  <div className="absolute w-1 rounded-full pointer-events-none"
                       style={{
                         height: `${Math.abs(gain) / 12 * 50}%`,
                         backgroundColor: gain > 0 ? '#22c55e' : gain < 0 ? '#ef4444' : 'transparent',
                         bottom: gain >= 0 ? '50%' : 'auto',
                         top: gain < 0 ? '50%' : 'auto',
                       }}
                  />
                </div>
                <span className={cn(
                  'text-xs font-mono mt-2',
                  gain > 0 ? 'text-green-400' : gain < 0 ? 'text-red-400' : 'text-white/60'
                )}>
                  {gain > 0 ? '+' : ''}{gain}
                </span>
              </div>
            ))}
          </div>

          {/* dB Scale Labels */}
          <div className="flex justify-between px-12 mt-4">
            <span className="text-xs text-white/40">-12 dB</span>
            <span className="text-xs text-white/40">0 dB</span>
            <span className="text-xs text-white/40">+12 dB</span>
          </div>
        </div>

        {/* Info */}
        <p className="text-xs text-white/40 text-center">
          Adjust frequency bands to customize your audio. Changes are saved automatically.
        </p>
      </div>
    </Modal>
  );
}
