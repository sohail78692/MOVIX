'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, X, Check } from 'lucide-react';
import { usePlayerStore } from '@/stores/playerStore';
import { Modal } from '@/components/ui/Modal';
import { cn } from '@/utils/helpers';

const presetTimes = [5, 10, 15, 20, 30, 45, 60, 90, 120];

export function SleepTimerModal() {
  const {
    showSleepTimer,
    setShowSleepTimer,
    sleepTimerMinutes,
    sleepTimerEndTime,
    setSleepTimer,
    clearSleepTimer,
  } = usePlayerStore();

  const [timeRemaining, setTimeRemaining] = useState<string>('');

  // Update remaining time display
  useEffect(() => {
    if (!sleepTimerEndTime) {
      setTimeRemaining('');
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      const remaining = sleepTimerEndTime - now;

      if (remaining <= 0) {
        setTimeRemaining('Time expired');
        return;
      }

      const minutes = Math.floor(remaining / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);
      setTimeRemaining(`${minutes}:${String(seconds).padStart(2, '0')}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [sleepTimerEndTime]);

  const handleSetTimer = (minutes: number) => {
    setSleepTimer(minutes);
  };

  const handleClearTimer = () => {
    clearSleepTimer();
  };

  return (
    <Modal
      isOpen={showSleepTimer}
      onClose={() => setShowSleepTimer(false)}
      title="Sleep Timer"
      size="sm"
    >
      <div className="space-y-6">
        {/* Active Timer Display */}
        {sleepTimerMinutes && sleepTimerEndTime && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-primary-500/10 border-2 border-primary-500"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary-500" />
                <span className="text-sm font-medium text-white">Active Timer</span>
              </div>
              <button
                onClick={handleClearTimer}
                className="p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4 text-white/60" />
              </button>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary-500 mb-1">{timeRemaining}</p>
              <p className="text-xs text-white/60">
                Set for {sleepTimerMinutes} minute{sleepTimerMinutes !== 1 ? 's' : ''}
              </p>
            </div>
          </motion.div>
        )}

        {/* Preset Times */}
        <div>
          <p className="text-sm font-medium text-white mb-3">Set Timer</p>
          <div className="grid grid-cols-3 gap-2">
            {presetTimes.map((minutes) => (
              <motion.button
                key={minutes}
                onClick={() => handleSetTimer(minutes)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  'p-3 rounded-xl transition-all font-medium text-sm',
                  'border-2',
                  sleepTimerMinutes === minutes
                    ? 'border-primary-500 bg-primary-500/20 text-primary-500'
                    : 'border-white/10 bg-white/5 text-white hover:border-white/20 hover:bg-white/10'
                )}
              >
                {minutes < 60 ? `${minutes} min` : `${minutes / 60}h`}
                {sleepTimerMinutes === minutes && (
                  <Check className="w-4 h-4 inline-block ml-1" />
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
          <p className="text-xs text-white/60 leading-relaxed">
            <Clock className="w-3 h-3 inline-block mr-1" />
            Playback will automatically pause when the timer expires. Perfect for falling asleep
            while watching.
          </p>
        </div>

        {/* Clear Button */}
        {sleepTimerMinutes && (
          <button
            onClick={handleClearTimer}
            className="w-full py-3 px-4 rounded-xl bg-red-500/10 hover:bg-red-500/20
                       border-2 border-red-500/50 text-red-500 font-medium text-sm
                       transition-all flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" />
            Clear Timer
          </button>
        )}
      </div>
    </Modal>
  );
}
