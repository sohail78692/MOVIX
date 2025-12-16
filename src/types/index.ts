export interface MediaFile {
  id: string;
  name: string;
  url: string;
  file?: File;
  duration: number;
  type: 'video' | 'audio';
  thumbnail?: string;
}

export interface Subtitle {
  startTime: number;
  endTime: number;
  text: string;
}

export interface SubtitleTrack {
  id: string;
  name: string;
  language?: string;
  subtitles: Subtitle[];
}

export interface AudioTrack {
  id: number;
  label: string;
  language?: string;
}

export interface VideoTrack {
  id: number;
  label: string;
  width?: number;
  height?: number;
}

export interface PlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  playbackRate: number;
  isFullscreen: boolean;
  isPiP: boolean;
  isLooping: boolean;
  isShuffled: boolean;
  buffered: number;
}

export interface EqualizerPreset {
  name: string;
  values: number[];
}

export interface VideoEffects {
  brightness: number;
  contrast: number;
  saturation: number;
  hue: number;
  blur: number;
}

export interface Settings {
  theme: 'dark' | 'light' | 'system';
  autoPlay: boolean;
  rememberPosition: boolean;
  hardwareAcceleration: boolean;
  subtitleSize: 'small' | 'medium' | 'large';
  subtitleColor: string;
  subtitleBackground: boolean;
  showOSD: boolean;
  seekDuration: number;
  volumeStep: number;
}

export type AspectRatio = 'auto' | '16:9' | '4:3' | '21:9' | '1:1';

export interface RecentFile {
  id: string;
  name: string;
  path: string;
  type: 'video' | 'audio';
  duration: number;
  lastPlayed: number; // timestamp
  thumbnail?: string;
}

export interface EqualizerBand {
  frequency: number;
  gain: number;
  label: string;
}

export interface EqualizerState {
  enabled: boolean;
  bands: number[]; // gains for each band (-12 to 12 dB)
  preamp: number;
  preset: string;
}

export interface Chapter {
  id: string;
  fileId: string;
  time: number;
  title: string;
}
