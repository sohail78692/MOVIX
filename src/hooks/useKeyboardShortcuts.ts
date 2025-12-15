'use client';

import { useEffect, useCallback } from 'react';
import { usePlayerStore } from '@/stores/playerStore';

export function useKeyboardShortcuts(videoRef: React.RefObject<HTMLVideoElement | null>) {
  const {
    isPlaying,
    setIsPlaying,
    volume,
    setVolume,
    toggleMute,
    playbackRate,
    setPlaybackRate,
    toggleLoop,
    toggleShuffle,
    playNext,
    playPrevious,
    isFullscreen,
    setFullscreen,
    setShowPlaylist,
    showPlaylist,
    setShowSettings,
    setShowShortcuts,
    setShowMediaInfo,
    subtitleDelay,
    setSubtitleDelay,
    audioDelay,
    setAudioDelay,
    settings,
    showOSD,
    currentMedia,
    toggleABLoop,
    setShowEqualizer,
    showEqualizer,
  } = usePlayerStore();

  const togglePlay = useCallback(() => {
    if (!videoRef.current || !currentMedia) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
  }, [isPlaying, videoRef, currentMedia]);

  const seek = useCallback(
    (seconds: number) => {
      if (!videoRef.current) return;
      const newTime = videoRef.current.currentTime + seconds;
      videoRef.current.currentTime = Math.max(0, Math.min(newTime, videoRef.current.duration || 0));
      showOSD(`${seconds > 0 ? '+' : ''}${seconds}s`);
    },
    [videoRef, showOSD]
  );

  const adjustVolume = useCallback(
    (delta: number) => {
      const newVolume = Math.max(0, Math.min(1, volume + delta));
      setVolume(newVolume);
      showOSD(`Volume: ${Math.round(newVolume * 100)}%`);
    },
    [volume, setVolume, showOSD]
  );

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setFullscreen(true);
    } else {
      document.exitFullscreen();
      setFullscreen(false);
    }
  }, [setFullscreen]);

  const takeScreenshot = useCallback(() => {
    const video = videoRef.current;
    if (!video || !currentMedia) return;

    try {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

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
  }, [videoRef, currentMedia, showOSD]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const ctrl = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;

      switch (e.key.toLowerCase()) {
        // Playback
        case ' ':
          e.preventDefault();
          togglePlay();
          break;

        case 'k':
          togglePlay();
          break;

        case 'arrowleft':
          e.preventDefault();
          seek(shift ? -60 : -settings.seekDuration);
          break;

        case 'arrowright':
          e.preventDefault();
          seek(shift ? 60 : settings.seekDuration);
          break;

        case 'j':
          seek(-10);
          break;

        case 'l':
          if (ctrl) {
            e.preventDefault();
            setShowPlaylist(!showPlaylist);
          } else {
            seek(10);
          }
          break;

        case 'p':
          playPrevious();
          break;

        case 'n':
          if (shift) {
            playNext();
          }
          break;

        case 'r':
          toggleLoop();
          break;

        case 'b':
          toggleABLoop();
          break;

        case 'e':
          setShowEqualizer(!showEqualizer);
          break;

        case 's':
          if (shift) {
            toggleShuffle();
          } else {
            takeScreenshot();
          }
          break;

        // Volume
        case 'arrowup':
          e.preventDefault();
          adjustVolume(settings.volumeStep / 100);
          break;

        case 'arrowdown':
          e.preventDefault();
          adjustVolume(-settings.volumeStep / 100);
          break;

        case 'm':
          toggleMute();
          showOSD(volume === 0 ? 'Unmuted' : 'Muted');
          break;

        // Speed
        case '>':
        case '.':
          if (shift || e.key === '>') {
            const newRate = Math.min(playbackRate + 0.25, 4);
            setPlaybackRate(newRate);
            if (videoRef.current) videoRef.current.playbackRate = newRate;
            showOSD(`Speed: ${newRate}x`);
          }
          break;

        case '<':
        case ',':
          if (shift || e.key === '<') {
            const newRate = Math.max(playbackRate - 0.25, 0.25);
            setPlaybackRate(newRate);
            if (videoRef.current) videoRef.current.playbackRate = newRate;
            showOSD(`Speed: ${newRate}x`);
          }
          break;

        // Fullscreen
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;

        case 'escape':
          if (document.fullscreenElement) {
            document.exitFullscreen();
            setFullscreen(false);
          }
          break;

        // UI
        case 'i':
          if (ctrl) {
            e.preventDefault();
            setShowMediaInfo(true);
          }
          break;

        case '?':
          e.preventDefault();
          setShowShortcuts(true);
          break;

        case 'f1':
          e.preventDefault();
          setShowShortcuts(true);
          break;

        // Subtitles
        case 'c':
          // Toggle captions - handled in subtitle component
          break;

        case 'g':
          setSubtitleDelay(subtitleDelay - 50);
          showOSD(`Subtitle delay: ${subtitleDelay - 50}ms`);
          break;

        case 'h':
          setSubtitleDelay(subtitleDelay + 50);
          showOSD(`Subtitle delay: ${subtitleDelay + 50}ms`);
          break;

        // Numbers for seeking percentage
        case '0':
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
          if (videoRef.current && videoRef.current.duration) {
            const percent = parseInt(e.key) / 10;
            videoRef.current.currentTime = videoRef.current.duration * percent;
          }
          break;

        // Home/End for start/end
        case 'home':
          if (videoRef.current) {
            videoRef.current.currentTime = 0;
          }
          break;

        case 'end':
          if (videoRef.current && videoRef.current.duration) {
            videoRef.current.currentTime = videoRef.current.duration;
          }
          break;
      }
    },
    [
      togglePlay,
      seek,
      adjustVolume,
      toggleMute,
      toggleLoop,
      toggleShuffle,
      toggleABLoop,
      playNext,
      playPrevious,
      toggleFullscreen,
      takeScreenshot,
      playbackRate,
      setPlaybackRate,
      showPlaylist,
      setShowPlaylist,
      setShowSettings,
      setShowShortcuts,
      setShowMediaInfo,
      setShowEqualizer,
      showEqualizer,
      setFullscreen,
      subtitleDelay,
      setSubtitleDelay,
      settings,
      showOSD,
      volume,
      videoRef,
    ]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [setFullscreen]);

  return {
    togglePlay,
    seek,
    adjustVolume,
    toggleFullscreen,
    takeScreenshot,
  };
}
