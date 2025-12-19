'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Film, Upload, FolderOpen } from 'lucide-react';
import { usePlayerStore, createMediaFile } from '@/stores/playerStore';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useAudioEqualizer } from '@/hooks/useAudioEqualizer';
import { getSubtitleAtTime } from '@/utils/subtitleParser';
import { isMediaFile, isSubtitleFile, cn } from '@/utils/helpers';
import { parseSubtitleFile } from '@/utils/subtitleParser';
import { Controls } from './Controls';
import { OSD } from './OSD';

export function VideoPlayer() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const subtitleInputRef = useRef<HTMLInputElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    currentMedia,
    isPlaying,
    setIsPlaying,
    setCurrentTime,
    setDuration,
    setBuffered,
    volume,
    isMuted,
    playbackRate,
    isLooping,
    controlsVisible,
    setControlsVisible,
    subtitles,
    subtitleDelay,
    setSubtitles,
    setCurrentSubtitle,
    currentSubtitle,
    effects,
    aspectRatio,
    addToPlaylist,
    playNext,
    settings,
    loopPointA,
    loopPointB,
    isABLooping,
    savePlaybackPosition,
    getPlaybackPosition,
    clearPlaybackPosition,
    showOSD,
    setAudioTracks,
    selectedAudioTrack,
    sleepTimerEndTime,
    clearSleepTimer,
    isLocked,
  } = usePlayerStore();

  // Refs for resume playback
  const lastSaveTimeRef = useRef<number>(0);
  const hasResumedRef = useRef<boolean>(false);

  // Refs for gesture handling
  const lastTapTimeRef = useRef<number>(0);
  const tapTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { togglePlay, toggleFullscreen } = useKeyboardShortcuts(videoRef);

  // Initialize audio equalizer
  useAudioEqualizer(videoRef);

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);

      // A-B Loop: check if we've reached point B
      if (isABLooping && loopPointA !== null && loopPointB !== null) {
        if (video.currentTime >= loopPointB) {
          video.currentTime = loopPointA;
        }
      }

      // Update subtitle
      if (subtitles.length > 0) {
        const currentSub = getSubtitleAtTime(
          subtitles,
          video.currentTime + subtitleDelay / 1000
        );
        setCurrentSubtitle(currentSub);
      }

      // Save playback position periodically (every 5 seconds)
      if (settings.rememberPosition && currentMedia) {
        const now = Date.now();
        if (now - lastSaveTimeRef.current > 5000) {
          lastSaveTimeRef.current = now;
          savePlaybackPosition(currentMedia.id, video.currentTime);
        }
      }
    };

    const handleProgress = () => {
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        setBuffered(bufferedEnd);
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      // Clear saved position when video completes
      if (currentMedia) {
        clearPlaybackPosition(currentMedia.id);
      }
      if (!isLooping) {
        playNext();
      }
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('progress', handleProgress);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('progress', handleProgress);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
    };
  }, [setCurrentTime, setDuration, setBuffered, setIsPlaying, subtitles, subtitleDelay, setCurrentSubtitle, isLooping, playNext, isABLooping, loopPointA, loopPointB, settings.rememberPosition, currentMedia, savePlaybackPosition, clearPlaybackPosition]);

  // Sync video state with store
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.playbackRate = playbackRate;
  }, [playbackRate]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.loop = isLooping;
  }, [isLooping]);

  // Load media when it changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !currentMedia) return;

    // Reset resume flag for new media
    hasResumedRef.current = false;

    video.src = currentMedia.url;
    video.load();

    // Detect audio tracks
    const handleLoadedMetadata = () => {
      // Note: audioTracks API is not universally supported
      // It works in Chrome/Edge but not in Firefox/Safari
      const videoElement = video as any;
      if (videoElement.audioTracks && videoElement.audioTracks.length > 0) {
        const tracks = Array.from(videoElement.audioTracks).map((track: any, index: number) => ({
          id: index,
          label: track.label || `Audio Track ${index + 1}`,
          language: track.language || undefined,
        }));
        setAudioTracks(tracks);
      } else {
        setAudioTracks([]);
      }
    };

    // Resume playback position once video is ready
    const handleCanPlay = () => {
      if (settings.rememberPosition && !hasResumedRef.current) {
        const savedPosition = getPlaybackPosition(currentMedia.id);
        if (savedPosition && savedPosition > 10 && savedPosition < video.duration - 10) {
          video.currentTime = savedPosition;
          hasResumedRef.current = true;
          showOSD(`Resuming from ${Math.floor(savedPosition / 60)}:${String(Math.floor(savedPosition % 60)).padStart(2, '0')}`);
        }
      }

      if (settings.autoPlay) {
        video.play().catch(() => {
          // Autoplay was prevented
        });
      }

      video.removeEventListener('canplay', handleCanPlay);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('canplay', handleCanPlay);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('canplay', handleCanPlay);
    };
  }, [currentMedia, settings.autoPlay, settings.rememberPosition, getPlaybackPosition, showOSD, setAudioTracks]);

  // Audio track switching
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const videoElement = video as any;
    if (!videoElement.audioTracks || videoElement.audioTracks.length === 0) return;

    // Enable the selected track and disable others
    Array.from(videoElement.audioTracks).forEach((track: any, index: number) => {
      track.enabled = index === selectedAudioTrack;
    });
  }, [selectedAudioTrack]);

  // Sleep timer
  useEffect(() => {
    if (!sleepTimerEndTime || !videoRef.current) return;

    const checkTimer = setInterval(() => {
      const now = Date.now();
      if (now >= sleepTimerEndTime) {
        // Pause the video
        if (videoRef.current && isPlaying) {
          videoRef.current.pause();
          showOSD('Sleep timer expired - Paused');
        }
        clearSleepTimer();
        clearInterval(checkTimer);
      }
    }, 1000);

    return () => clearInterval(checkTimer);
  }, [sleepTimerEndTime, isPlaying, clearSleepTimer, showOSD]);

  // Controls visibility
  const showControls = useCallback(() => {
    setControlsVisible(true);

    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }

    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setControlsVisible(false);
      }, 3000);
    }
  }, [isPlaying, setControlsVisible]);

  const handleMouseMove = useCallback(() => {
    showControls();
  }, [showControls]);

  const handleMouseLeave = useCallback(() => {
    if (isPlaying) {
      setControlsVisible(false);
    }
  }, [isPlaying, setControlsVisible]);

  // Drag and drop
  const [isDragging, setIsDragging] = React.useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);

    // Handle subtitle files
    const subtitleFiles = files.filter((f) => isSubtitleFile(f.name));
    if (subtitleFiles.length > 0) {
      const subs = await parseSubtitleFile(subtitleFiles[0]);
      setSubtitles(subs);
    }

    // Handle media files
    const mediaFiles = files.filter((f) => isMediaFile(f.name));
    if (mediaFiles.length > 0) {
      const mediaItems = mediaFiles.map(createMediaFile);
      addToPlaylist(mediaItems);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const mediaFiles = files.filter((f) => isMediaFile(f.name));

    if (mediaFiles.length > 0) {
      const mediaItems = mediaFiles.map(createMediaFile);
      addToPlaylist(mediaItems);
    }

    e.target.value = '';
  };

  const handleSubtitleSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const subs = await parseSubtitleFile(file);
      setSubtitles(subs);
    }
    e.target.value = '';
  };

  // Video filter styles
  const videoStyle: React.CSSProperties = {
    filter: `
      brightness(${effects.brightness}%)
      contrast(${effects.contrast}%)
      saturate(${effects.saturation}%)
      hue-rotate(${effects.hue}deg)
      blur(${effects.blur}px)
    `.replace(/\s+/g, ' '),
    objectFit: aspectRatio === 'auto' ? 'contain' : 'fill',
    aspectRatio: aspectRatio !== 'auto' ? aspectRatio.replace(':', '/') : undefined,
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative w-full h-full bg-black overflow-hidden',
        !controlsVisible && isPlaying && 'cursor-none'
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full"
        style={videoStyle}
        playsInline
      />

      {/* Gesture Overlay for Mobile/Desktop Seeking */}
      {currentMedia && (
        <div
          className="absolute inset-0 z-10"
          onClick={(e) => {
            e.preventDefault();

            if (isLocked) {
              setControlsVisible(true);
              return;
            }

            const now = Date.now();
            const timeDiff = now - lastTapTimeRef.current;
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const width = rect.width;
            const percentage = x / width;

            if (timeDiff < 300) {
              // Double tap detected
              if (tapTimeoutRef.current) {
                clearTimeout(tapTimeoutRef.current);
                tapTimeoutRef.current = null;
              }

              if (percentage < 0.3) {
                // Left side double tap - Seek backward
                if (videoRef.current) {
                  videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
                  showOSD('Rewind 10s');
                }
              } else if (percentage > 0.7) {
                // Right side double tap - Seek forward
                if (videoRef.current) {
                  videoRef.current.currentTime = Math.min(videoRef.current.duration, videoRef.current.currentTime + 10);
                  showOSD('Forward 10s');
                }
              } else {
                // Center double tap - Toggle Fullscreen
                toggleFullscreen();
              }
            } else {
              // Single tap candidate
              tapTimeoutRef.current = setTimeout(() => {
                // Single tap anywhere toggles play, or restrict to center if desired.
                // Taking "click in very middle just pause" literally, but assuming toggle is better.
                togglePlay();
                // Also show controls on interaction
                setControlsVisible(true);
              }, 300);
            }

            lastTapTimeRef.current = now;
          }}
          onDoubleClick={(e) => e.preventDefault()} // Prevent default double click behavior
        />
      )}

      {/* Subtitles */}
      <AnimatePresence>
        {currentSubtitle && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={cn(
              'absolute bottom-24 left-1/2 -translate-x-1/2 text-center',
              'px-4 py-2 rounded-lg max-w-[80%]',
              settings.subtitleBackground && 'bg-black/75',
              settings.subtitleSize === 'small' && 'text-lg',
              settings.subtitleSize === 'medium' && 'text-2xl',
              settings.subtitleSize === 'large' && 'text-3xl'
            )}
            style={{ color: settings.subtitleColor }}
          >
            <span
              className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
              dangerouslySetInnerHTML={{ __html: currentSubtitle.text.replace(/\n/g, '<br/>') }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Center Play Button */}
      <AnimatePresence>
        {!isPlaying && currentMedia && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 m-auto w-20 h-20 rounded-full bg-primary-500/90 hover:bg-primary-500
                       flex items-center justify-center transition-all hover:scale-110
                       shadow-[0_0_40px_rgba(249,115,22,0.5)] z-20"
            onClick={togglePlay}
          >
            <Play className="w-10 h-10 text-white ml-1" fill="white" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* No Media Placeholder */}
      {!currentMedia && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="relative mb-8">
              <Film className="w-24 h-24 text-primary-500 mx-auto" />
              <motion.div
                className="absolute inset-0 w-24 h-24 mx-auto rounded-full bg-primary-500/20"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>

            <h1 className="text-4xl font-bold text-white mb-2">
              <span className="text-primary-500">MOV</span>IX
            </h1>
            <p className="text-white/60 mb-8">Drop media files here or click to browse</p>

            <div className="flex gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600
                           rounded-xl text-white font-medium transition-colors"
              >
                <FolderOpen className="w-5 h-5" />
                Open File
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => subtitleInputRef.current?.click()}
                className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20
                           rounded-xl text-white font-medium transition-colors"
              >
                <Upload className="w-5 h-5" />
                Load Subtitles
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Drop Zone Overlay */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-primary-500/20 backdrop-blur-sm
                       border-4 border-dashed border-primary-500 rounded-xl
                       flex items-center justify-center z-50"
          >
            <div className="text-center">
              <Upload className="w-16 h-16 text-primary-500 mx-auto mb-4" />
              <p className="text-xl font-medium text-white">Drop files here</p>
              <p className="text-white/60">Videos, audio, or subtitles</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* OSD */}
      <OSD />

      {/* Controls */}
      <Controls videoRef={videoRef} containerRef={containerRef} />

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*,audio/*,.mkv,.avi,.mov,.wmv,.flv"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />
      <input
        ref={subtitleInputRef}
        type="file"
        accept=".srt,.vtt,.ass,.ssa,.sub"
        onChange={handleSubtitleSelect}
        className="hidden"
      />
    </div>
  );
}
