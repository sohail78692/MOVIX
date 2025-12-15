'use client';

import { useEffect, useRef } from 'react';
import { usePlayerStore } from '@/stores/playerStore';

// 10-band EQ frequencies
const EQ_FREQUENCIES = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];

export function useAudioEqualizer(videoRef: React.RefObject<HTMLVideoElement | null>) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const filtersRef = useRef<BiquadFilterNode[]>([]);
  const isConnectedRef = useRef(false);

  const { equalizer } = usePlayerStore();

  // Initialize audio context and connect to video
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const initAudio = () => {
      // Only initialize once
      if (isConnectedRef.current) return;

      try {
        // Create audio context
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = audioContext;

        // Create source from video element
        const source = audioContext.createMediaElementSource(video);
        sourceRef.current = source;

        // Create preamp gain node
        const gainNode = audioContext.createGain();
        gainNodeRef.current = gainNode;

        // Create filters for each frequency band
        const filters: BiquadFilterNode[] = EQ_FREQUENCIES.map((freq, index) => {
          const filter = audioContext.createBiquadFilter();

          if (index === 0) {
            filter.type = 'lowshelf';
          } else if (index === EQ_FREQUENCIES.length - 1) {
            filter.type = 'highshelf';
          } else {
            filter.type = 'peaking';
          }

          filter.frequency.value = freq;
          filter.Q.value = 1.4; // Quality factor
          filter.gain.value = 0;

          return filter;
        });
        filtersRef.current = filters;

        // Connect the audio graph: source -> gain -> filters -> destination
        source.connect(gainNode);

        let lastNode: AudioNode = gainNode;
        filters.forEach((filter) => {
          lastNode.connect(filter);
          lastNode = filter;
        });

        lastNode.connect(audioContext.destination);
        isConnectedRef.current = true;
      } catch (error) {
        console.error('Failed to initialize audio equalizer:', error);
      }
    };

    // Initialize on user interaction (required for AudioContext)
    const handleInteraction = () => {
      initAudio();
      video.removeEventListener('play', handleInteraction);
    };

    video.addEventListener('play', handleInteraction);

    return () => {
      video.removeEventListener('play', handleInteraction);
    };
  }, [videoRef]);

  // Update equalizer settings when they change
  useEffect(() => {
    if (!isConnectedRef.current) return;

    const audioContext = audioContextRef.current;
    const gainNode = gainNodeRef.current;
    const filters = filtersRef.current;

    if (!audioContext || !gainNode || filters.length === 0) return;

    // Resume audio context if suspended
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }

    // Update preamp
    if (equalizer.enabled) {
      // Convert dB to gain value
      gainNode.gain.value = Math.pow(10, equalizer.preamp / 20);
    } else {
      gainNode.gain.value = 1;
    }

    // Update filter gains
    filters.forEach((filter, index) => {
      if (equalizer.enabled) {
        filter.gain.value = equalizer.bands[index] || 0;
      } else {
        filter.gain.value = 0;
      }
    });
  }, [equalizer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);
}
