'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Monitor,
  Subtitles,
  Sliders,
  Sun,
  Moon,
  Laptop,
} from 'lucide-react';
import { usePlayerStore } from '@/stores/playerStore';
import { Modal } from '@/components/ui/Modal';
import { Slider } from '@/components/ui/Slider';
import { cn } from '@/utils/helpers';

export function SettingsModal() {
  const {
    showSettings,
    setShowSettings,
    settings,
    updateSettings,
    effects,
    setEffects,
    resetEffects,
  } = usePlayerStore();

  const [activeTab, setActiveTab] = React.useState('general');

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'appearance', label: 'Appearance', icon: Sun },
    { id: 'playback', label: 'Playback', icon: Monitor },
    { id: 'subtitles', label: 'Subtitles', icon: Subtitles },
    { id: 'effects', label: 'Effects', icon: Sliders },
  ];

  return (
    <Modal
      isOpen={showSettings}
      onClose={() => setShowSettings(false)}
      title="Settings"
      size="lg"
    >
      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-40 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium',
                'transition-colors text-left',
                activeTab === tab.id
                  ? 'bg-primary-500/20 text-primary-500'
                  : 'text-gray-600 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 min-h-[300px]">
          {activeTab === 'general' && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">General Settings</h3>

              <div className="space-y-4">
                {/* Auto Play */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Auto Play</p>
                    <p className="text-xs text-gray-500 dark:text-white/40">Automatically play media when loaded</p>
                  </div>
                  <button
                    onClick={() => updateSettings({ autoPlay: !settings.autoPlay })}
                    className={cn(
                      'w-12 h-6 rounded-full transition-colors relative',
                      settings.autoPlay ? 'bg-primary-500' : 'bg-gray-300 dark:bg-white/20'
                    )}
                  >
                    <motion.div
                      animate={{ x: settings.autoPlay ? 24 : 2 }}
                      className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"
                    />
                  </button>
                </div>

                {/* Remember Position */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Remember Position</p>
                    <p className="text-xs text-gray-500 dark:text-white/40">Resume playback from last position</p>
                  </div>
                  <button
                    onClick={() => updateSettings({ rememberPosition: !settings.rememberPosition })}
                    className={cn(
                      'w-12 h-6 rounded-full transition-colors relative',
                      settings.rememberPosition ? 'bg-primary-500' : 'bg-gray-300 dark:bg-white/20'
                    )}
                  >
                    <motion.div
                      animate={{ x: settings.rememberPosition ? 24 : 2 }}
                      className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"
                    />
                  </button>
                </div>

                {/* Show OSD */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Show OSD</p>
                    <p className="text-xs text-gray-500 dark:text-white/40">Display on-screen notifications</p>
                  </div>
                  <button
                    onClick={() => updateSettings({ showOSD: !settings.showOSD })}
                    className={cn(
                      'w-12 h-6 rounded-full transition-colors relative',
                      settings.showOSD ? 'bg-primary-500' : 'bg-gray-300 dark:bg-white/20'
                    )}
                  >
                    <motion.div
                      animate={{ x: settings.showOSD ? 24 : 2 }}
                      className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"
                    />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'appearance' && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Appearance</h3>

              <div className="space-y-6">
                {/* Theme Selection */}
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-3">Theme</p>
                  <div className="grid grid-cols-3 gap-3">
                    {/* Light Theme */}
                    <button
                      onClick={() => updateSettings({ theme: 'light' })}
                      className={cn(
                        'flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all',
                        settings.theme === 'light'
                          ? 'border-primary-500 bg-primary-500/10'
                          : 'border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 bg-gray-50 dark:bg-white/5'
                      )}
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-200 to-orange-300 flex items-center justify-center">
                        <Sun className="w-6 h-6 text-yellow-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Light</span>
                    </button>

                    {/* Dark Theme */}
                    <button
                      onClick={() => updateSettings({ theme: 'dark' })}
                      className={cn(
                        'flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all',
                        settings.theme === 'dark'
                          ? 'border-primary-500 bg-primary-500/10'
                          : 'border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 bg-gray-50 dark:bg-white/5'
                      )}
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                        <Moon className="w-6 h-6 text-slate-300" />
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Dark</span>
                    </button>

                    {/* System Theme */}
                    <button
                      onClick={() => updateSettings({ theme: 'system' })}
                      className={cn(
                        'flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all',
                        settings.theme === 'system'
                          ? 'border-primary-500 bg-primary-500/10'
                          : 'border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 bg-gray-50 dark:bg-white/5'
                      )}
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                        <Laptop className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">System</span>
                    </button>
                  </div>
                </div>

                {/* Theme Description */}
                <div className="p-4 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10">
                  <p className="text-sm text-gray-600 dark:text-white/60">
                    {settings.theme === 'light' && 'Light theme for bright environments.'}
                    {settings.theme === 'dark' && 'Dark theme for comfortable viewing in low light.'}
                    {settings.theme === 'system' && 'Automatically match your system preferences.'}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'playback' && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Playback Settings</h3>

              <div className="space-y-6">
                {/* Seek Duration */}
                <div>
                  <div className="flex justify-between mb-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Seek Duration</p>
                    <span className="text-sm text-primary-500">{settings.seekDuration}s</span>
                  </div>
                  <Slider
                    value={settings.seekDuration}
                    min={5}
                    max={30}
                    onChange={(val) => updateSettings({ seekDuration: Math.round(val) })}
                    className="h-2"
                    trackClassName="bg-gray-200 dark:bg-white/20"
                    fillClassName="bg-primary-500"
                  />
                </div>

                {/* Volume Step */}
                <div>
                  <div className="flex justify-between mb-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Volume Step</p>
                    <span className="text-sm text-primary-500">{settings.volumeStep}%</span>
                  </div>
                  <Slider
                    value={settings.volumeStep}
                    min={1}
                    max={20}
                    onChange={(val) => updateSettings({ volumeStep: Math.round(val) })}
                    className="h-2"
                    trackClassName="bg-gray-200 dark:bg-white/20"
                    fillClassName="bg-primary-500"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'subtitles' && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Subtitle Settings</h3>

              <div className="space-y-6">
                {/* Subtitle Size */}
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-3">Subtitle Size</p>
                  <div className="flex gap-2">
                    {(['small', 'medium', 'large'] as const).map((size) => (
                      <button
                        key={size}
                        onClick={() => updateSettings({ subtitleSize: size })}
                        className={cn(
                          'flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors capitalize',
                          settings.subtitleSize === size
                            ? 'bg-primary-500 text-white'
                            : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white/60 hover:bg-gray-200 dark:hover:bg-white/20'
                        )}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subtitle Color */}
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-3">Subtitle Color</p>
                  <div className="flex gap-2">
                    {['#ffffff', '#ffff00', '#00ff00', '#00ffff', '#ff00ff'].map((color) => (
                      <button
                        key={color}
                        onClick={() => updateSettings({ subtitleColor: color })}
                        className={cn(
                          'w-10 h-10 rounded-lg border-2 transition-all',
                          settings.subtitleColor === color
                            ? 'border-primary-500 scale-110'
                            : 'border-gray-300 dark:border-transparent hover:border-gray-400 dark:hover:border-white/20'
                        )}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                {/* Subtitle Background */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Subtitle Background</p>
                    <p className="text-xs text-gray-500 dark:text-white/40">Show dark background behind subtitles</p>
                  </div>
                  <button
                    onClick={() => updateSettings({ subtitleBackground: !settings.subtitleBackground })}
                    className={cn(
                      'w-12 h-6 rounded-full transition-colors relative',
                      settings.subtitleBackground ? 'bg-primary-500' : 'bg-gray-300 dark:bg-white/20'
                    )}
                  >
                    <motion.div
                      animate={{ x: settings.subtitleBackground ? 24 : 2 }}
                      className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"
                    />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'effects' && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Video Effects</h3>
                <button
                  onClick={resetEffects}
                  className="px-3 py-1 text-sm text-primary-500 hover:bg-primary-500/10 rounded-lg transition-colors"
                >
                  Reset All
                </button>
              </div>

              <div className="space-y-5">
                {/* Brightness */}
                <div>
                  <div className="flex justify-between mb-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Brightness</p>
                    <span className="text-sm text-primary-500">{effects.brightness}%</span>
                  </div>
                  <Slider
                    value={effects.brightness}
                    min={0}
                    max={200}
                    onChange={(val) => setEffects({ brightness: Math.round(val) })}
                    className="h-2"
                    trackClassName="bg-gray-200 dark:bg-white/20"
                    fillClassName="bg-primary-500"
                  />
                </div>

                {/* Contrast */}
                <div>
                  <div className="flex justify-between mb-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Contrast</p>
                    <span className="text-sm text-primary-500">{effects.contrast}%</span>
                  </div>
                  <Slider
                    value={effects.contrast}
                    min={0}
                    max={200}
                    onChange={(val) => setEffects({ contrast: Math.round(val) })}
                    className="h-2"
                    trackClassName="bg-gray-200 dark:bg-white/20"
                    fillClassName="bg-primary-500"
                  />
                </div>

                {/* Saturation */}
                <div>
                  <div className="flex justify-between mb-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Saturation</p>
                    <span className="text-sm text-primary-500">{effects.saturation}%</span>
                  </div>
                  <Slider
                    value={effects.saturation}
                    min={0}
                    max={200}
                    onChange={(val) => setEffects({ saturation: Math.round(val) })}
                    className="h-2"
                    trackClassName="bg-gray-200 dark:bg-white/20"
                    fillClassName="bg-primary-500"
                  />
                </div>

                {/* Hue */}
                <div>
                  <div className="flex justify-between mb-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Hue Rotation</p>
                    <span className="text-sm text-primary-500">{effects.hue}°</span>
                  </div>
                  <Slider
                    value={effects.hue}
                    min={0}
                    max={360}
                    onChange={(val) => setEffects({ hue: Math.round(val) })}
                    className="h-2"
                    trackClassName="bg-gray-200 dark:bg-white/20"
                    fillClassName="bg-gradient-to-r from-red-500 via-green-500 to-blue-500"
                  />
                </div>

                {/* Blur */}
                <div>
                  <div className="flex justify-between mb-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Blur</p>
                    <span className="text-sm text-primary-500">{effects.blur}px</span>
                  </div>
                  <Slider
                    value={effects.blur}
                    min={0}
                    max={20}
                    onChange={(val) => setEffects({ blur: Math.round(val) })}
                    className="h-2"
                    trackClassName="bg-gray-200 dark:bg-white/20"
                    fillClassName="bg-primary-500"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </Modal>
  );
}
