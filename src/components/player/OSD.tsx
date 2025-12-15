'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePlayerStore } from '@/stores/playerStore';

export function OSD() {
  const { osdMessage, osdVisible } = usePlayerStore();

  return (
    <AnimatePresence>
      {osdVisible && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0 }}
          className="absolute top-6 left-6 px-4 py-2 bg-black/80 backdrop-blur-sm
                     rounded-lg text-white text-sm font-medium shadow-lg
                     border border-white/10"
        >
          {osdMessage}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
