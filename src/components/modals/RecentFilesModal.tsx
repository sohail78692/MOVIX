'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Clock,
  Film,
  Music,
  Trash2,
  Play,
  AlertCircle,
} from 'lucide-react';
import { usePlayerStore, createMediaFile } from '@/stores/playerStore';
import { formatTime } from '@/utils/helpers';
import { Modal } from '@/components/ui/Modal';

export function RecentFilesModal() {
  const {
    recentFiles,
    showRecentFiles,
    setShowRecentFiles,
    removeFromRecentFiles,
    clearRecentFiles,
    addToPlaylist,
    showOSD,
  } = usePlayerStore();

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return 'Today';
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const handlePlayRecent = async (recentFile: typeof recentFiles[0]) => {
    // Since we can't directly access the file system, we'll show a message
    // that the user needs to re-add the file
    showOSD(`Please re-add "${recentFile.name}" to play`);

    // Create a file input to let user select the file
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/*,audio/*,.mkv,.avi,.mov,.wmv,.flv';

    input.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      if (files.length > 0) {
        const mediaItems = files.map(createMediaFile);
        addToPlaylist(mediaItems);
        setShowRecentFiles(false);
      }
    };

    input.click();
  };

  return (
    <Modal
      isOpen={showRecentFiles}
      onClose={() => setShowRecentFiles(false)}
      title="Recent Files"
      size="lg"
    >
      <div className="w-full max-w-lg max-h-[60vh] flex flex-col">
        {/* Header Actions */}
        {recentFiles.length > 0 && (
          <div className="flex justify-end mb-4">
            <button
              onClick={clearRecentFiles}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-400
                         bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 
                         rounded-lg transition-all active:scale-95"
            >
              <Trash2 className="w-4 h-4" />
              Clear History
            </button>
          </div>
        )}

        {/* Recent Files List */}
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          {recentFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Clock className="w-16 h-16 text-white/10 mb-4" />
              <p className="text-white/60 mb-2 font-medium">No recent files</p>
              <p className="text-white/40 text-sm">
                Files you play will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentFiles.map((file, index) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="group flex items-center gap-3 p-3 rounded-xl
                             bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 
                             transition-all"
                >
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                    {file.type === 'video' ? (
                      <Film className="w-6 h-6 text-primary-500" />
                    ) : (
                      <Music className="w-6 h-6 text-primary-500" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate mb-0.5">
                      {file.name}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-white/40">
                      <span className="bg-white/5 px-2 py-0.5 rounded-full">{formatDate(file.lastPlayed)}</span>
                      {file.duration > 0 && (
                        <span>{formatTime(file.duration)}</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handlePlayRecent(file)}
                      className="p-2 rounded-lg bg-primary-500/10 hover:bg-primary-500/20 text-primary-500 transition-colors"
                      title="Play"
                    >
                      <Play className="w-4 h-4 fill-current" />
                    </button>
                    <button
                      onClick={() => removeFromRecentFiles(file.id)}
                      className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-red-400 transition-colors"
                      title="Remove from history"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Info Note */}
        {recentFiles.length > 0 && (
          <div className="mt-6 p-4 rounded-xl bg-orange-900/10 border border-orange-500/10">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-orange-200">
                  Authentication Required
                </p>
                <p className="text-xs text-orange-200/60 leading-relaxed">
                  Due to browser security policies, you&apos;ll need to re-select this file from your device to play it again.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
