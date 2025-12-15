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
      <div className="w-[500px] max-h-[60vh] flex flex-col">
        {/* Header Actions */}
        {recentFiles.length > 0 && (
          <div className="flex justify-end mb-4">
            <button
              onClick={clearRecentFiles}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-400
                         hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Clear History
            </button>
          </div>
        )}

        {/* Recent Files List */}
        <div className="flex-1 overflow-y-auto">
          {recentFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Clock className="w-16 h-16 text-white/20 mb-4" />
              <p className="text-white/60 mb-2">No recent files</p>
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
                  className="group flex items-center gap-3 p-3 rounded-lg
                             bg-white/5 hover:bg-white/10 transition-colors"
                >
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                    {file.type === 'video' ? (
                      <Film className="w-5 h-5 text-primary-500" />
                    ) : (
                      <Music className="w-5 h-5 text-primary-500" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {file.name}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-white/40">
                      <span>{formatDate(file.lastPlayed)}</span>
                      {file.duration > 0 && (
                        <>
                          <span>•</span>
                          <span>{formatTime(file.duration)}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handlePlayRecent(file)}
                      className="p-2 rounded-lg hover:bg-primary-500/20 transition-colors"
                      title="Play"
                    >
                      <Play className="w-4 h-4 text-primary-500" />
                    </button>
                    <button
                      onClick={() => removeFromRecentFiles(file.id)}
                      className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
                      title="Remove from history"
                    >
                      <X className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Info Note */}
        {recentFiles.length > 0 && (
          <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-200/80">
                Due to browser security, you&apos;ll need to re-select files from your device to play them again.
              </p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
