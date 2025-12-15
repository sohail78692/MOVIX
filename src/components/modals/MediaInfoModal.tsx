'use client';

import React from 'react';
import { Film, Clock, HardDrive, Monitor, Music } from 'lucide-react';
import { usePlayerStore } from '@/stores/playerStore';
import { Modal } from '@/components/ui/Modal';
import { formatTime, formatFileSize } from '@/utils/helpers';

export function MediaInfoModal() {
  const { showMediaInfo, setShowMediaInfo, currentMedia, duration } = usePlayerStore();

  if (!currentMedia) return null;

  const infoItems = [
    {
      icon: Film,
      label: 'File Name',
      value: currentMedia.name,
    },
    {
      icon: Clock,
      label: 'Duration',
      value: duration > 0 ? formatTime(duration) : 'Unknown',
    },
    {
      icon: HardDrive,
      label: 'File Size',
      value: currentMedia.file ? formatFileSize(currentMedia.file.size) : 'Unknown',
    },
    {
      icon: Monitor,
      label: 'Type',
      value: currentMedia.type === 'video' ? 'Video' : 'Audio',
    },
    {
      icon: Music,
      label: 'Format',
      value: currentMedia.file?.type || 'Unknown',
    },
  ];

  return (
    <Modal
      isOpen={showMediaInfo}
      onClose={() => setShowMediaInfo(false)}
      title="Media Information"
      size="md"
    >
      <div className="space-y-4">
        {infoItems.map((item, index) => (
          <div
            key={index}
            className="flex items-start gap-4 p-3 rounded-lg bg-white/5"
          >
            <div className="p-2 rounded-lg bg-primary-500/20">
              <item.icon className="w-5 h-5 text-primary-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-white/40 uppercase tracking-wider">{item.label}</p>
              <p className="text-sm text-white font-medium truncate">{item.value}</p>
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}
