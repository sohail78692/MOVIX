'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Volume2, Check } from 'lucide-react';
import { usePlayerStore } from '@/stores/playerStore';
import { Modal } from '@/components/ui/Modal';
import { cn } from '@/utils/helpers';

export function AudioTracksModal() {
  const {
    showAudioTracks,
    setShowAudioTracks,
    audioTracks,
    selectedAudioTrack,
    setSelectedAudioTrack,
  } = usePlayerStore();

  const handleTrackSelect = (trackId: number) => {
    setSelectedAudioTrack(trackId);
  };

  return (
    <Modal
      isOpen={showAudioTracks}
      onClose={() => setShowAudioTracks(false)}
      title="Audio Tracks"
      size="sm"
    >
      <div className="space-y-3">
        {audioTracks.length === 0 ? (
          <div className="text-center py-8">
            <Volume2 className="w-12 h-12 text-white/20 mx-auto mb-3" />
            <p className="text-sm text-white/60">No audio tracks available</p>
            <p className="text-xs text-white/40 mt-1">
              Multi-audio support works with MKV and MP4 files
            </p>
          </div>
        ) : (
          audioTracks.map((track) => (
            <motion.button
              key={track.id}
              onClick={() => handleTrackSelect(track.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                'w-full flex items-center justify-between p-4 rounded-xl transition-all',
                'border-2',
                selectedAudioTrack === track.id
                  ? 'border-primary-500 bg-primary-500/10'
                  : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center',
                    selectedAudioTrack === track.id
                      ? 'bg-primary-500'
                      : 'bg-white/10'
                  )}
                >
                  {selectedAudioTrack === track.id ? (
                    <Check className="w-5 h-5 text-white" />
                  ) : (
                    <Volume2 className="w-5 h-5 text-white/60" />
                  )}
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-white">{track.label}</p>
                  {track.language && (
                    <p className="text-xs text-white/60">{track.language}</p>
                  )}
                </div>
              </div>
            </motion.button>
          ))
        )}

        {audioTracks.length > 0 && (
          <div className="pt-3 border-t border-white/10">
            <p className="text-xs text-white/40 text-center">
              {audioTracks.length} audio track{audioTracks.length !== 1 ? 's' : ''} available
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
