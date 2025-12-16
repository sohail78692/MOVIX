'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, Plus, Trash2, Play, Edit2, Check, X } from 'lucide-react';
import { usePlayerStore } from '@/stores/playerStore';
import { Modal } from '@/components/ui/Modal';
import { formatTime, cn } from '@/utils/helpers';

export function ChaptersModal() {
  const {
    showChapters,
    setShowChapters,
    currentMedia,
    chapters,
    addChapter,
    removeChapter,
    updateChapter,
    currentTime,
  } = usePlayerStore();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [newMarkerTitle, setNewMarkerTitle] = useState('');

  const fileChapters = currentMedia
    ? chapters.filter((c) => c.fileId === currentMedia.id)
    : [];

  const handleAddMarker = () => {
    if (!currentMedia) return;

    const title = newMarkerTitle.trim() || `Marker ${fileChapters.length + 1}`;
    addChapter(currentMedia.id, currentTime, title);
    setNewMarkerTitle('');
  };

  const handleSeek = (time: number) => {
    const video = document.querySelector('video');
    if (video) {
      video.currentTime = time;
    }
  };

  const startEdit = (id: string, currentTitle: string) => {
    setEditingId(id);
    setEditTitle(currentTitle);
  };

  const saveEdit = () => {
    if (editingId && editTitle.trim()) {
      updateChapter(editingId, editTitle.trim());
    }
    setEditingId(null);
    setEditTitle('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
  };

  return (
    <Modal
      isOpen={showChapters}
      onClose={() => setShowChapters(false)}
      title="Chapters & Markers"
      size="md"
    >
      <div className="space-y-4">
        {/* Add new marker */}
        {currentMedia && (
          <div className="flex gap-2">
            <input
              type="text"
              value={newMarkerTitle}
              onChange={(e) => setNewMarkerTitle(e.target.value)}
              placeholder={`Marker at ${formatTime(currentTime)}`}
              className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg
                         text-white placeholder-white/40 focus:outline-none focus:border-primary-500"
              onKeyDown={(e) => e.key === 'Enter' && handleAddMarker()}
            />
            <button
              onClick={handleAddMarker}
              className="px-4 py-2 bg-primary-500 hover:bg-primary-600 rounded-lg
                         text-white font-medium flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>
        )}

        {/* Chapter list */}
        <div className="max-h-80 overflow-y-auto space-y-2">
          <AnimatePresence mode="popLayout">
            {fileChapters.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8 text-white/40"
              >
                <Bookmark className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No markers yet</p>
                <p className="text-sm mt-1">
                  Press <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-xs">Ctrl+M</kbd> to add a marker
                </p>
              </motion.div>
            ) : (
              fileChapters.map((chapter) => (
                <motion.div
                  key={chapter.id}
                  layout
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group'
                  )}
                >
                  <button
                    onClick={() => handleSeek(chapter.time)}
                    className="p-2 rounded-full bg-primary-500/20 text-primary-500
                               hover:bg-primary-500 hover:text-white transition-colors"
                  >
                    <Play className="w-4 h-4" fill="currentColor" />
                  </button>

                  <div className="flex-1 min-w-0">
                    {editingId === chapter.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="flex-1 px-2 py-1 bg-white/10 border border-primary-500 rounded
                                     text-white text-sm focus:outline-none"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEdit();
                            if (e.key === 'Escape') cancelEdit();
                          }}
                          autoFocus
                        />
                        <button
                          onClick={saveEdit}
                          className="p-1 text-green-500 hover:bg-green-500/20 rounded"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="p-1 text-red-500 hover:bg-red-500/20 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <p className="text-white font-medium truncate">{chapter.title}</p>
                        <p className="text-white/40 text-sm">{formatTime(chapter.time)}</p>
                      </>
                    )}
                  </div>

                  {editingId !== chapter.id && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => startEdit(chapter.id, chapter.title)}
                        className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeChapter(chapter.id)}
                        className="p-2 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Help text */}
        <div className="pt-4 border-t border-white/10 text-center">
          <p className="text-white/40 text-sm">
            Click on a marker to jump to that position
          </p>
        </div>
      </div>
    </Modal>
  );
}
