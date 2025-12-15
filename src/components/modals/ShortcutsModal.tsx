'use client';

import React from 'react';
import { usePlayerStore } from '@/stores/playerStore';
import { Modal } from '@/components/ui/Modal';

const shortcuts = [
  {
    category: 'Playback',
    items: [
      { key: 'Space / K', action: 'Play / Pause' },
      { key: '←', action: 'Seek -10 seconds' },
      { key: '→', action: 'Seek +10 seconds' },
      { key: 'Shift + ←', action: 'Seek -1 minute' },
      { key: 'Shift + →', action: 'Seek +1 minute' },
      { key: 'J', action: 'Seek -10 seconds' },
      { key: 'L', action: 'Seek +10 seconds' },
      { key: '0-9', action: 'Seek to 0%-90%' },
      { key: 'Home', action: 'Go to start' },
      { key: 'End', action: 'Go to end' },
      { key: 'P', action: 'Previous track' },
      { key: 'Shift + N', action: 'Next track' },
      { key: 'R', action: 'Toggle loop' },
      { key: 'Shift + S', action: 'Toggle shuffle' },
    ],
  },
  {
    category: 'Volume',
    items: [
      { key: '↑', action: 'Volume up' },
      { key: '↓', action: 'Volume down' },
      { key: 'M', action: 'Mute / Unmute' },
    ],
  },
  {
    category: 'Speed',
    items: [
      { key: '> / .', action: 'Increase speed' },
      { key: '< / ,', action: 'Decrease speed' },
    ],
  },
  {
    category: 'Display',
    items: [
      { key: 'F', action: 'Toggle fullscreen' },
      { key: 'Esc', action: 'Exit fullscreen' },
      { key: 'Ctrl + L', action: 'Toggle playlist' },
      { key: 'Ctrl + I', action: 'Media info' },
      { key: '? / F1', action: 'Show shortcuts' },
    ],
  },
  {
    category: 'Subtitles',
    items: [
      { key: 'C', action: 'Toggle subtitles' },
      { key: 'G', action: 'Subtitle delay -50ms' },
      { key: 'H', action: 'Subtitle delay +50ms' },
    ],
  },
];

export function ShortcutsModal() {
  const { showShortcuts, setShowShortcuts } = usePlayerStore();

  return (
    <Modal
      isOpen={showShortcuts}
      onClose={() => setShowShortcuts(false)}
      title="Keyboard Shortcuts"
      size="xl"
    >
      <div className="grid grid-cols-2 gap-6">
        {shortcuts.map((section) => (
          <div key={section.category}>
            <h3 className="text-sm font-semibold text-primary-500 mb-3 uppercase tracking-wider">
              {section.category}
            </h3>
            <div className="space-y-2">
              {section.items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-1"
                >
                  <span className="text-sm text-white/60">{item.action}</span>
                  <kbd className="px-2 py-1 bg-white/10 rounded text-xs font-mono text-white border border-white/10">
                    {item.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}
