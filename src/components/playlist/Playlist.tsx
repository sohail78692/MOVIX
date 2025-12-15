'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Search,
  Plus,
  Trash2,
  Play,
  Music,
  Film,
  GripVertical,
  MoreVertical,
} from 'lucide-react';
import { usePlayerStore, createMediaFile } from '@/stores/playerStore';
import { formatTime, isMediaFile, cn } from '@/utils/helpers';

export function Playlist() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const {
    playlist,
    currentMedia,
    showPlaylist,
    setShowPlaylist,
    playById,
    removeFromPlaylist,
    clearPlaylist,
    addToPlaylist,
  } = usePlayerStore();

  const filteredPlaylist = searchQuery
    ? playlist.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : playlist;

  const totalDuration = playlist.reduce((acc, item) => acc + item.duration, 0);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const mediaFiles = files.filter((f) => isMediaFile(f.name));

    if (mediaFiles.length > 0) {
      const mediaItems = mediaFiles.map(createMediaFile);
      addToPlaylist(mediaItems);
    }

    e.target.value = '';
  };

  const handleDragStart = (id: string) => {
    setDraggedId(id);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
  };

  return (
    <AnimatePresence>
      {showPlaylist && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="absolute right-0 top-0 bottom-0 w-80 bg-dark-900/95 backdrop-blur-xl
                     border-l border-white/10 flex flex-col z-40"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Music className="w-5 h-5 text-primary-500" />
              Playlist
            </h2>
            <button
              onClick={() => setShowPlaylist(false)}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-white/60" />
            </button>
          </div>

          {/* Search */}
          <div className="p-3 border-b border-white/10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder="Search playlist..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-10 pr-4
                           text-sm text-white placeholder-white/40 focus:outline-none
                           focus:border-primary-500/50 transition-colors"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 p-3 border-b border-white/10">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 flex items-center justify-center gap-2 py-2 bg-primary-500
                         hover:bg-primary-600 rounded-lg text-white text-sm font-medium
                         transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Files
            </button>
            <button
              onClick={clearPlaylist}
              disabled={playlist.length === 0}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-4 h-4 text-white/60" />
            </button>
          </div>

          {/* Playlist Items */}
          <div className="flex-1 overflow-y-auto">
            {filteredPlaylist.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <Music className="w-16 h-16 text-white/20 mb-4" />
                <p className="text-white/60 mb-2">
                  {searchQuery ? 'No results found' : 'Playlist is empty'}
                </p>
                {!searchQuery && (
                  <p className="text-white/40 text-sm">
                    Drop files or click Add Files
                  </p>
                )}
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {filteredPlaylist.map((item, index) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ delay: index * 0.02 }}
                    draggable
                    onDragStart={() => handleDragStart(item.id)}
                    onDragEnd={handleDragEnd}
                    onClick={() => playById(item.id)}
                    className={cn(
                      'group flex items-center gap-3 p-3 rounded-lg cursor-pointer',
                      'transition-all hover:bg-white/5',
                      currentMedia?.id === item.id &&
                        'bg-primary-500/20 border-l-2 border-primary-500',
                      draggedId === item.id && 'opacity-50'
                    )}
                  >
                    {/* Drag Handle */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
                      <GripVertical className="w-4 h-4 text-white/40" />
                    </div>

                    {/* Icon */}
                    <div
                      className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center',
                        currentMedia?.id === item.id
                          ? 'bg-primary-500'
                          : 'bg-white/10'
                      )}
                    >
                      {currentMedia?.id === item.id ? (
                        <Play className="w-4 h-4 text-white" fill="white" />
                      ) : item.type === 'video' ? (
                        <Film className="w-4 h-4 text-white/60" />
                      ) : (
                        <Music className="w-4 h-4 text-white/60" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          'text-sm font-medium truncate',
                          currentMedia?.id === item.id
                            ? 'text-primary-500'
                            : 'text-white'
                        )}
                      >
                        {item.name}
                      </p>
                      <p className="text-xs text-white/40">
                        {item.duration > 0
                          ? formatTime(item.duration)
                          : 'Unknown duration'}
                      </p>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromPlaylist(item.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md
                                 hover:bg-red-500/20 transition-all"
                    >
                      <X className="w-4 h-4 text-red-400" />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-white/10 bg-dark-950/50">
            <div className="flex justify-between text-xs text-white/40">
              <span>{playlist.length} items</span>
              <span>{formatTime(totalDuration)}</span>
            </div>
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*,audio/*,.mkv,.avi,.mov,.wmv,.flv"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
