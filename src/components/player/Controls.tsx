'use client';

import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Volume1,
  Maximize,
  Minimize,
  ListMusic,
  Settings,
  Repeat,
  Repeat1,
  Shuffle,
  Subtitles,
  PictureInPicture2,
  Gauge,
  Clock,
  Camera,
  SlidersHorizontal,
  Bookmark,
  Music2,
  Timer,
} from 'lucide-react';
import { usePlayerStore } from '@/stores/playerStore';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { Slider } from '@/components/ui/Slider';
import { Tooltip } from '@/components/ui/Tooltip';
import { formatTime, cn } from '@/utils/helpers';

interface ControlsProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export function Controls({ videoRef, containerRef }: ControlsProps) {
  const [showVolumeSlider, setShowVolumeSlider] = React.useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = React.useState(false);
  const volumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    currentMedia,
    isPlaying,
    currentTime,
    duration,
    buffered,
    volume,
    setVolume,
    isMuted,
    toggleMute,
    playbackRate,
    setPlaybackRate,
    isLooping,
    toggleLoop,
    isShuffled,
    toggleShuffle,
    isFullscreen,
    setFullscreen,
    controlsVisible,
    showPlaylist,
    setShowPlaylist,
    setShowSettings,
    subtitles,
    playNext,
    playPrevious,
    showOSD,
    recentFiles,
    setShowRecentFiles,
    loopPointA,
    loopPointB,
    isABLooping,
    toggleABLoop,
    equalizer,
    setShowEqualizer,
    setShowChapters,
    chapters,
    audioTracks,
    setShowAudioTracks,
    setShowSleepTimer,
    sleepTimerEndTime,
  } = usePlayerStore();

  const { togglePlay, toggleFullscreen } = useKeyboardShortcuts(videoRef);

  const handleSeek = (value: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value;
    }
  };

  const handleVolumeChange = (value: number) => {
    setVolume(value);
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackRate(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    showOSD(`Speed: ${speed}x`);
    setShowSpeedMenu(false);
  };

  const togglePiP = async () => {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (videoRef.current) {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (err) {
      console.error('PiP error:', err);
    }
  };

  const takeScreenshot = () => {
    const video = videoRef.current;
    if (!video || !currentMedia) return;

    try {
      // Create canvas with video dimensions
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw current video frame
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (!blob) return;

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${currentMedia.name}_screenshot_${Math.floor(video.currentTime)}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showOSD('Screenshot saved!');
      }, 'image/png');
    } catch (err) {
      console.error('Screenshot error:', err);
      showOSD('Screenshot failed');
    }
  };

  const getVolumeIcon = () => {
    if (isMuted || volume === 0) return VolumeX;
    if (volume < 0.5) return Volume1;
    return Volume2;
  };

  const VolumeIcon = getVolumeIcon();
  const speeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

  return (
    <AnimatePresence>
      {(controlsVisible || !isPlaying) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-20 z-20"
        >
          <div className="px-4 pb-4">
            {/* Progress Bar */}
            <div className="mb-3">
              <Slider
                value={currentTime}
                max={duration || 100}
                onChange={handleSeek}
                buffered={buffered}
                showTooltip
                formatTooltip={(val) => formatTime(val)}
                className="h-1.5 group-hover:h-2"
                trackClassName="bg-white/30"
                fillClassName="bg-primary-500"
                videoRef={videoRef}
                showThumbnail
                chapters={currentMedia ? chapters.filter(c => c.fileId === currentMedia.id) : []}
              />
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              {/* Left Controls */}
              <div className="flex items-center gap-1">
                {/* Play/Pause */}
                <Tooltip content={isPlaying ? 'Pause (Space)' : 'Play (Space)'}>
                  <button
                    onClick={togglePlay}
                    disabled={!currentMedia}
                    className="p-2.5 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
                  >
                    {isPlaying ? (
                      <Pause className="w-6 h-6 text-white" fill="white" />
                    ) : (
                      <Play className="w-6 h-6 text-white" fill="white" />
                    )}
                  </button>
                </Tooltip>

                {/* Previous */}
                <Tooltip content="Previous (P)">
                  <button
                    onClick={playPrevious}
                    disabled={!currentMedia}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
                  >
                    <SkipBack className="w-5 h-5 text-white" />
                  </button>
                </Tooltip>

                {/* Next */}
                <Tooltip content="Next (Shift+N)">
                  <button
                    onClick={playNext}
                    disabled={!currentMedia}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
                  >
                    <SkipForward className="w-5 h-5 text-white" />
                  </button>
                </Tooltip>

                {/* Volume */}
                <div
                  className="relative flex items-center"
                  onMouseEnter={() => {
                    if (volumeTimeoutRef.current) clearTimeout(volumeTimeoutRef.current);
                    setShowVolumeSlider(true);
                  }}
                  onMouseLeave={() => {
                    volumeTimeoutRef.current = setTimeout(() => {
                      setShowVolumeSlider(false);
                    }, 300);
                  }}
                >
                  <Tooltip content={isMuted ? 'Unmute (M)' : 'Mute (M)'}>
                    <button
                      onClick={toggleMute}
                      className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <VolumeIcon className="w-5 h-5 text-white" />
                    </button>
                  </Tooltip>

                  <AnimatePresence>
                    {showVolumeSlider && (
                      <motion.div
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 100, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-2 w-[100px]">
                          <Slider
                            value={isMuted ? 0 : volume}
                            max={1}
                            onChange={handleVolumeChange}
                            className="h-1"
                            trackClassName="bg-white/30"
                            fillClassName="bg-white"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <span className="text-sm text-white/80 ml-1 w-10">
                    {Math.round((isMuted ? 0 : volume) * 100)}%
                  </span>
                </div>

                {/* Time Display */}
                <div className="text-sm text-white/80 ml-4 font-mono">
                  <span>{formatTime(currentTime)}</span>
                  <span className="text-white/40 mx-1">/</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Right Controls */}
              <div className="flex items-center gap-1">
                {/* Subtitles */}
                <Tooltip content="Subtitles">
                  <button
                    onClick={() => { }}
                    className={cn(
                      'p-2 rounded-lg hover:bg-white/10 transition-colors',
                      subtitles.length > 0 && 'text-primary-500'
                    )}
                  >
                    <Subtitles className="w-5 h-5" />
                  </button>
                </Tooltip>

                {/* Speed */}
                <div className="relative">
                  <Tooltip content="Playback Speed">
                    <button
                      onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                      className="p-2 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-1"
                    >
                      <Gauge className="w-5 h-5 text-white" />
                      <span className="text-xs text-white/80">{playbackRate}x</span>
                    </button>
                  </Tooltip>

                  <AnimatePresence>
                    {showSpeedMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute bottom-full right-0 mb-2 py-2 bg-dark-900/95 backdrop-blur-sm
                                   rounded-lg border border-white/10 shadow-xl min-w-[120px]"
                      >
                        {speeds.map((speed) => (
                          <button
                            key={speed}
                            onClick={() => handleSpeedChange(speed)}
                            className={cn(
                              'w-full px-4 py-2 text-left text-sm hover:bg-white/10 transition-colors',
                              playbackRate === speed
                                ? 'text-primary-500'
                                : 'text-white'
                            )}
                          >
                            {speed}x {speed === 1 && '(Normal)'}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Loop */}
                <Tooltip content="Loop (R)">
                  <button
                    onClick={toggleLoop}
                    className={cn(
                      'p-2 rounded-lg hover:bg-white/10 transition-colors',
                      isLooping && 'text-primary-500'
                    )}
                  >
                    <Repeat className="w-5 h-5" />
                  </button>
                </Tooltip>

                {/* A-B Loop */}
                <Tooltip content={
                  loopPointA === null
                    ? "Set Loop Point A (B)"
                    : loopPointB === null
                      ? "Set Loop Point B (B)"
                      : "Clear A-B Loop (B)"
                }>
                  <button
                    onClick={toggleABLoop}
                    disabled={!currentMedia}
                    className={cn(
                      'p-2 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50 relative',
                      isABLooping && 'text-primary-500'
                    )}
                  >
                    <Repeat1 className="w-5 h-5" />
                    {loopPointA !== null && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary-500 rounded-full text-[8px] flex items-center justify-center text-white font-bold">
                        {loopPointB !== null ? '2' : '1'}
                      </span>
                    )}
                  </button>
                </Tooltip>

                {/* Shuffle */}
                <Tooltip content="Shuffle (Shift+S)">
                  <button
                    onClick={toggleShuffle}
                    className={cn(
                      'p-2 rounded-lg hover:bg-white/10 transition-colors',
                      isShuffled && 'text-primary-500'
                    )}
                  >
                    <Shuffle className="w-5 h-5" />
                  </button>
                </Tooltip>

                {/* Picture in Picture */}
                <Tooltip content="Picture in Picture">
                  <button
                    onClick={togglePiP}
                    disabled={!currentMedia}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
                  >
                    <PictureInPicture2 className="w-5 h-5 text-white" />
                  </button>
                </Tooltip>

                {/* Screenshot */}
                <Tooltip content="Screenshot (S)">
                  <button
                    onClick={takeScreenshot}
                    disabled={!currentMedia}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
                  >
                    <Camera className="w-5 h-5 text-white" />
                  </button>
                </Tooltip>

                {/* Playlist */}
                <Tooltip content="Playlist (Ctrl+L)">
                  <button
                    onClick={() => setShowPlaylist(!showPlaylist)}
                    className={cn(
                      'p-2 rounded-lg hover:bg-white/10 transition-colors',
                      showPlaylist && 'text-primary-500 bg-white/10'
                    )}
                  >
                    <ListMusic className="w-5 h-5" />
                  </button>
                </Tooltip>

                {/* Chapters/Markers */}
                <Tooltip content="Chapters (Ctrl+M)">
                  <button
                    onClick={() => setShowChapters(true)}
                    className={cn(
                      'p-2 rounded-lg hover:bg-white/10 transition-colors',
                      currentMedia && chapters.filter(c => c.fileId === currentMedia.id).length > 0 && 'text-primary-500'
                    )}
                  >
                    <Bookmark className="w-5 h-5" />
                  </button>
                </Tooltip>

                {/* Equalizer */}
                <Tooltip content="Equalizer (E)">
                  <button
                    onClick={() => setShowEqualizer(true)}
                    className={cn(
                      'p-2 rounded-lg hover:bg-white/10 transition-colors',
                      equalizer.enabled && 'text-primary-500'
                    )}
                  >
                    <SlidersHorizontal className="w-5 h-5" />
                  </button>
                </Tooltip>

                {/* Audio Tracks */}
                <Tooltip content="Audio Tracks (A)">
                  <button
                    onClick={() => setShowAudioTracks(true)}
                    className={cn(
                      'p-2 rounded-lg hover:bg-white/10 transition-colors',
                      audioTracks.length > 1 && 'text-primary-500'
                    )}
                  >
                    <Music2 className="w-5 h-5" />
                  </button>
                </Tooltip>

                {/* Sleep Timer */}
                <Tooltip content="Sleep Timer (T)">
                  <button
                    onClick={() => setShowSleepTimer(true)}
                    className={cn(
                      'p-2 rounded-lg hover:bg-white/10 transition-colors',
                      sleepTimerEndTime !== null && 'text-primary-500'
                    )}
                  >
                    <Timer className="w-5 h-5" />
                  </button>
                </Tooltip>

                {/* Recent Files */}
                <Tooltip content="Recent Files">
                  <button
                    onClick={() => setShowRecentFiles(true)}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <Clock className="w-5 h-5 text-white" />
                  </button>
                </Tooltip>

                {/* Settings */}
                <Tooltip content="Settings">
                  <button
                    onClick={() => setShowSettings(true)}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <Settings className="w-5 h-5 text-white" />
                  </button>
                </Tooltip>

                {/* Fullscreen */}
                <Tooltip content={isFullscreen ? 'Exit Fullscreen (F)' : 'Fullscreen (F)'}>
                  <button
                    onClick={toggleFullscreen}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    {isFullscreen ? (
                      <Minimize className="w-5 h-5 text-white" />
                    ) : (
                      <Maximize className="w-5 h-5 text-white" />
                    )}
                  </button>
                </Tooltip>
              </div>
            </div>

            {/* Media Title */}
            {currentMedia && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-2 text-sm text-white/60 truncate"
              >
                {currentMedia.name}
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
