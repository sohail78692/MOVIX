import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MediaFile, Subtitle, VideoEffects, Settings, AspectRatio, RecentFile, EqualizerState } from '@/types';
import { generateId, shuffleArray } from '@/utils/helpers';

interface PlayerStore {
  // Media
  currentMedia: MediaFile | null;
  playlist: MediaFile[];
  shuffledPlaylist: MediaFile[];
  currentIndex: number;

  // Playback state
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  buffered: number;
  volume: number;
  isMuted: boolean;
  playbackRate: number;
  isLooping: boolean;
  isShuffled: boolean;

  // UI state
  isFullscreen: boolean;
  isPiP: boolean;
  showPlaylist: boolean;
  showSettings: boolean;
  showEqualizer: boolean;
  showEffects: boolean;
  showMediaInfo: boolean;
  showShortcuts: boolean;
  controlsVisible: boolean;

  // Subtitles
  subtitles: Subtitle[];
  subtitleDelay: number;
  currentSubtitle: Subtitle | null;

  // Audio
  audioDelay: number;

  // Video effects
  effects: VideoEffects;
  aspectRatio: AspectRatio;

  // Settings
  settings: Settings;

  // OSD
  osdMessage: string;
  osdVisible: boolean;

  // Recent Files
  recentFiles: RecentFile[];
  showRecentFiles: boolean;

  // A-B Loop
  loopPointA: number | null;
  loopPointB: number | null;
  isABLooping: boolean;

  // Equalizer
  equalizer: EqualizerState;

  // Actions
  setCurrentMedia: (media: MediaFile | null) => void;
  addToPlaylist: (files: MediaFile[]) => void;
  removeFromPlaylist: (id: string) => void;
  clearPlaylist: () => void;
  playByIndex: (index: number) => void;
  playById: (id: string) => void;
  playNext: () => void;
  playPrevious: () => void;

  setIsPlaying: (playing: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setBuffered: (buffered: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setPlaybackRate: (rate: number) => void;
  toggleLoop: () => void;
  toggleShuffle: () => void;

  setFullscreen: (fullscreen: boolean) => void;
  setPiP: (pip: boolean) => void;
  setShowPlaylist: (show: boolean) => void;
  setShowSettings: (show: boolean) => void;
  setShowEqualizer: (show: boolean) => void;
  setShowEffects: (show: boolean) => void;
  setShowMediaInfo: (show: boolean) => void;
  setShowShortcuts: (show: boolean) => void;
  setControlsVisible: (visible: boolean) => void;

  setSubtitles: (subtitles: Subtitle[]) => void;
  setSubtitleDelay: (delay: number) => void;
  setCurrentSubtitle: (subtitle: Subtitle | null) => void;
  clearSubtitles: () => void;

  setAudioDelay: (delay: number) => void;

  setEffects: (effects: Partial<VideoEffects>) => void;
  resetEffects: () => void;
  setAspectRatio: (ratio: AspectRatio) => void;

  updateSettings: (settings: Partial<Settings>) => void;

  showOSD: (message: string) => void;
  hideOSD: () => void;

  // Recent Files Actions
  addToRecentFiles: (file: MediaFile) => void;
  removeFromRecentFiles: (id: string) => void;
  clearRecentFiles: () => void;
  setShowRecentFiles: (show: boolean) => void;

  // A-B Loop Actions
  setLoopPointA: (time: number | null) => void;
  setLoopPointB: (time: number | null) => void;
  toggleABLoop: () => void;
  clearABLoop: () => void;

  // Equalizer Actions
  setEqualizerEnabled: (enabled: boolean) => void;
  setEqualizerBand: (index: number, gain: number) => void;
  setEqualizerPreamp: (preamp: number) => void;
  setEqualizerPreset: (preset: string) => void;
  resetEqualizer: () => void;
}

const defaultEffects: VideoEffects = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  hue: 0,
  blur: 0,
};

const defaultEqualizer: EqualizerState = {
  enabled: false,
  bands: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 10 bands, all at 0 dB
  preamp: 0,
  preset: 'flat',
};

// EQ Presets (10-band: 32, 64, 125, 250, 500, 1K, 2K, 4K, 8K, 16K Hz)
export const eqPresets: Record<string, { name: string; bands: number[]; preamp: number }> = {
  flat: { name: 'Flat', bands: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], preamp: 0 },
  bass: { name: 'Bass Boost', bands: [6, 5, 4, 2, 0, 0, 0, 0, 0, 0], preamp: -2 },
  treble: { name: 'Treble Boost', bands: [0, 0, 0, 0, 0, 0, 2, 4, 5, 6], preamp: -2 },
  vocal: { name: 'Vocal', bands: [-2, -1, 0, 2, 4, 4, 3, 1, 0, -1], preamp: 0 },
  rock: { name: 'Rock', bands: [5, 4, 2, 0, -1, 0, 2, 4, 5, 5], preamp: -2 },
  pop: { name: 'Pop', bands: [-1, 1, 3, 4, 3, 0, -1, -1, 1, 2], preamp: 0 },
  jazz: { name: 'Jazz', bands: [3, 2, 1, 2, -1, -1, 0, 1, 2, 3], preamp: 0 },
  classical: { name: 'Classical', bands: [4, 3, 2, 1, -1, -1, 0, 2, 3, 4], preamp: 0 },
  electronic: { name: 'Electronic', bands: [5, 4, 1, 0, -2, 1, 0, 2, 4, 5], preamp: -2 },
  hiphop: { name: 'Hip-Hop', bands: [5, 4, 1, 2, -1, -1, 1, 0, 2, 3], preamp: -1 },
};

const defaultSettings: Settings = {
  theme: 'dark',
  autoPlay: true,
  rememberPosition: true,
  hardwareAcceleration: true,
  subtitleSize: 'medium',
  subtitleColor: '#ffffff',
  subtitleBackground: true,
  showOSD: true,
  seekDuration: 10,
  volumeStep: 5,
};

export const usePlayerStore = create<PlayerStore>()(
  persist(
    (set, get) => ({
      // Initial state
      currentMedia: null,
      playlist: [],
      shuffledPlaylist: [],
      currentIndex: -1,

      isPlaying: false,
      currentTime: 0,
      duration: 0,
      buffered: 0,
      volume: 1,
      isMuted: false,
      playbackRate: 1,
      isLooping: false,
      isShuffled: false,

      isFullscreen: false,
      isPiP: false,
      showPlaylist: false,
      showSettings: false,
      showEqualizer: false,
      showEffects: false,
      showMediaInfo: false,
      showShortcuts: false,
      controlsVisible: true,

      subtitles: [],
      subtitleDelay: 0,
      currentSubtitle: null,

      audioDelay: 0,

      effects: defaultEffects,
      aspectRatio: 'auto',

      settings: defaultSettings,

      osdMessage: '',
      osdVisible: false,

      recentFiles: [],
      showRecentFiles: false,

      loopPointA: null,
      loopPointB: null,
      isABLooping: false,

      equalizer: defaultEqualizer,

      // Actions
      setCurrentMedia: (media) => set({ currentMedia: media }),

      addToPlaylist: (files) => {
        const { playlist, isShuffled } = get();
        const newPlaylist = [...playlist, ...files];
        const newShuffled = isShuffled ? shuffleArray(newPlaylist) : newPlaylist;

        set({
          playlist: newPlaylist,
          shuffledPlaylist: newShuffled,
        });

        if (playlist.length === 0 && files.length > 0) {
          get().playByIndex(0);
        }
      },

      removeFromPlaylist: (id) => {
        const { playlist, currentMedia, currentIndex, isShuffled } = get();
        const newPlaylist = playlist.filter((item) => item.id !== id);
        const newShuffled = isShuffled ? shuffleArray(newPlaylist) : newPlaylist;

        let newIndex = currentIndex;
        if (currentMedia?.id === id) {
          if (newPlaylist.length > 0) {
            newIndex = Math.min(currentIndex, newPlaylist.length - 1);
            set({
              playlist: newPlaylist,
              shuffledPlaylist: newShuffled,
              currentIndex: newIndex,
              currentMedia: newPlaylist[newIndex],
            });
          } else {
            set({
              playlist: [],
              shuffledPlaylist: [],
              currentIndex: -1,
              currentMedia: null,
            });
          }
        } else {
          const removedIndex = playlist.findIndex((item) => item.id === id);
          if (removedIndex < currentIndex) {
            newIndex = currentIndex - 1;
          }
          set({
            playlist: newPlaylist,
            shuffledPlaylist: newShuffled,
            currentIndex: newIndex,
          });
        }
      },

      clearPlaylist: () => {
        set({
          playlist: [],
          shuffledPlaylist: [],
          currentIndex: -1,
          currentMedia: null,
          isPlaying: false,
        });
      },

      playByIndex: (index) => {
        const { playlist, shuffledPlaylist, isShuffled, addToRecentFiles } = get();
        const list = isShuffled ? shuffledPlaylist : playlist;

        if (index >= 0 && index < list.length) {
          const media = list[index];
          set({
            currentIndex: index,
            currentMedia: media,
            currentTime: 0,
          });
          // Add to recent files
          addToRecentFiles(media);
        }
      },

      playById: (id) => {
        const { playlist, shuffledPlaylist, isShuffled } = get();
        const list = isShuffled ? shuffledPlaylist : playlist;
        const index = list.findIndex((item) => item.id === id);

        if (index !== -1) {
          get().playByIndex(index);
        }
      },

      playNext: () => {
        const { playlist, shuffledPlaylist, isShuffled, currentIndex, isLooping } = get();
        const list = isShuffled ? shuffledPlaylist : playlist;

        if (list.length === 0) return;

        let nextIndex = currentIndex + 1;
        if (nextIndex >= list.length) {
          nextIndex = isLooping ? 0 : list.length - 1;
        }

        if (nextIndex !== currentIndex || isLooping) {
          get().playByIndex(nextIndex);
        }
      },

      playPrevious: () => {
        const { playlist, shuffledPlaylist, isShuffled, currentIndex, currentTime } = get();
        const list = isShuffled ? shuffledPlaylist : playlist;

        if (list.length === 0) return;

        if (currentTime > 3) {
          set({ currentTime: 0 });
        } else {
          let prevIndex = currentIndex - 1;
          if (prevIndex < 0) {
            prevIndex = list.length - 1;
          }
          get().playByIndex(prevIndex);
        }
      },

      setIsPlaying: (playing) => set({ isPlaying: playing }),
      setCurrentTime: (time) => set({ currentTime: time }),
      setDuration: (duration) => set({ duration }),
      setBuffered: (buffered) => set({ buffered }),

      setVolume: (volume) => {
        const clampedVolume = Math.max(0, Math.min(1, volume));
        set({ volume: clampedVolume, isMuted: clampedVolume === 0 });
      },

      toggleMute: () => {
        const { isMuted, volume } = get();
        if (isMuted) {
          set({ isMuted: false, volume: volume || 0.5 });
        } else {
          set({ isMuted: true });
        }
      },

      setPlaybackRate: (rate) => set({ playbackRate: rate }),

      toggleLoop: () => {
        const { isLooping } = get();
        set({ isLooping: !isLooping });
        get().showOSD(!isLooping ? 'Loop: On' : 'Loop: Off');
      },

      toggleShuffle: () => {
        const { isShuffled, playlist } = get();
        const newShuffled = !isShuffled;
        set({
          isShuffled: newShuffled,
          shuffledPlaylist: newShuffled ? shuffleArray(playlist) : playlist,
        });
        get().showOSD(newShuffled ? 'Shuffle: On' : 'Shuffle: Off');
      },

      setFullscreen: (fullscreen) => set({ isFullscreen: fullscreen }),
      setPiP: (pip) => set({ isPiP: pip }),
      setShowPlaylist: (show) => set({ showPlaylist: show }),
      setShowSettings: (show) => set({ showSettings: show }),
      setShowEqualizer: (show) => set({ showEqualizer: show }),
      setShowEffects: (show) => set({ showEffects: show }),
      setShowMediaInfo: (show) => set({ showMediaInfo: show }),
      setShowShortcuts: (show) => set({ showShortcuts: show }),
      setControlsVisible: (visible) => set({ controlsVisible: visible }),

      setSubtitles: (subtitles) => set({ subtitles }),
      setSubtitleDelay: (delay) => set({ subtitleDelay: delay }),
      setCurrentSubtitle: (subtitle) => set({ currentSubtitle: subtitle }),
      clearSubtitles: () => set({ subtitles: [], currentSubtitle: null }),

      setAudioDelay: (delay) => set({ audioDelay: delay }),

      setEffects: (newEffects) => {
        const { effects } = get();
        set({ effects: { ...effects, ...newEffects } });
      },

      resetEffects: () => set({ effects: defaultEffects }),

      setAspectRatio: (ratio) => {
        set({ aspectRatio: ratio });
        get().showOSD(`Aspect Ratio: ${ratio}`);
      },

      updateSettings: (newSettings) => {
        const { settings } = get();
        set({ settings: { ...settings, ...newSettings } });
      },

      showOSD: (message) => {
        const { settings } = get();
        if (settings.showOSD) {
          set({ osdMessage: message, osdVisible: true });
          setTimeout(() => set({ osdVisible: false }), 2000);
        }
      },

      hideOSD: () => set({ osdVisible: false }),

      // Recent Files Actions
      addToRecentFiles: (file) => {
        const { recentFiles } = get();
        const MAX_RECENT_FILES = 20;

        // Create recent file entry
        const recentFile: RecentFile = {
          id: file.id,
          name: file.name,
          path: file.file?.name || file.name,
          type: file.type,
          duration: file.duration,
          lastPlayed: Date.now(),
        };

        // Remove existing entry with same name (to move it to top)
        const filtered = recentFiles.filter((rf) => rf.name !== file.name);

        // Add to beginning and limit to MAX_RECENT_FILES
        const updated = [recentFile, ...filtered].slice(0, MAX_RECENT_FILES);

        set({ recentFiles: updated });
      },

      removeFromRecentFiles: (id) => {
        const { recentFiles } = get();
        set({ recentFiles: recentFiles.filter((rf) => rf.id !== id) });
      },

      clearRecentFiles: () => set({ recentFiles: [] }),

      setShowRecentFiles: (show) => set({ showRecentFiles: show }),

      // A-B Loop Actions
      setLoopPointA: (time) => {
        set({ loopPointA: time });
        if (time !== null) {
          get().showOSD(`Loop point A: ${Math.floor(time)}s`);
        }
      },

      setLoopPointB: (time) => {
        const { loopPointA } = get();
        if (time !== null && loopPointA !== null && time > loopPointA) {
          set({ loopPointB: time, isABLooping: true });
          get().showOSD(`Loop A-B: ${Math.floor(loopPointA)}s - ${Math.floor(time)}s`);
        } else if (time !== null) {
          set({ loopPointB: time });
          get().showOSD(`Loop point B: ${Math.floor(time)}s`);
        }
      },

      toggleABLoop: () => {
        const { currentTime, loopPointA, loopPointB, isABLooping } = get();

        if (loopPointA === null) {
          // Set point A
          set({ loopPointA: currentTime });
          get().showOSD(`Loop point A set: ${Math.floor(currentTime)}s`);
        } else if (loopPointB === null) {
          // Set point B and start looping
          if (currentTime > loopPointA) {
            set({ loopPointB: currentTime, isABLooping: true });
            get().showOSD(`A-B Loop: ${Math.floor(loopPointA)}s - ${Math.floor(currentTime)}s`);
          } else {
            get().showOSD('Point B must be after point A');
          }
        } else {
          // Clear loop
          set({ loopPointA: null, loopPointB: null, isABLooping: false });
          get().showOSD('A-B Loop cleared');
        }
      },

      clearABLoop: () => {
        set({ loopPointA: null, loopPointB: null, isABLooping: false });
        get().showOSD('A-B Loop cleared');
      },

      // Equalizer Actions
      setEqualizerEnabled: (enabled) => {
        const { equalizer } = get();
        set({ equalizer: { ...equalizer, enabled } });
        get().showOSD(enabled ? 'Equalizer: On' : 'Equalizer: Off');
      },

      setEqualizerBand: (index, gain) => {
        const { equalizer } = get();
        const newBands = [...equalizer.bands];
        newBands[index] = Math.max(-12, Math.min(12, gain));
        set({ equalizer: { ...equalizer, bands: newBands, preset: 'custom' } });
      },

      setEqualizerPreamp: (preamp) => {
        const { equalizer } = get();
        set({ equalizer: { ...equalizer, preamp: Math.max(-12, Math.min(12, preamp)) } });
      },

      setEqualizerPreset: (preset) => {
        const presetData = eqPresets[preset];
        if (presetData) {
          const { equalizer } = get();
          set({
            equalizer: {
              ...equalizer,
              bands: [...presetData.bands],
              preamp: presetData.preamp,
              preset,
            },
          });
          get().showOSD(`EQ: ${presetData.name}`);
        }
      },

      resetEqualizer: () => {
        set({ equalizer: defaultEqualizer });
        get().showOSD('Equalizer reset');
      },
    }),
    {
      name: 'movix-player-storage',
      partialize: (state) => ({
        volume: state.volume,
        playbackRate: state.playbackRate,
        isLooping: state.isLooping,
        settings: state.settings,
        effects: state.effects,
        recentFiles: state.recentFiles,
        equalizer: state.equalizer,
      }),
    }
  )
);

// Helper function to add files to playlist
export function createMediaFile(file: File): MediaFile {
  const isVideo = file.type.startsWith('video/') ||
    ['mkv', 'avi', 'mov', 'wmv', 'flv'].some(ext => file.name.toLowerCase().endsWith(ext));

  return {
    id: generateId(),
    name: file.name.replace(/\.[^/.]+$/, ''),
    url: URL.createObjectURL(file),
    file,
    duration: 0,
    type: isVideo ? 'video' : 'audio',
  };
}
