'use client';

import { VideoPlayer } from '@/components/player/VideoPlayer';
import { Playlist } from '@/components/playlist/Playlist';
import { SettingsModal } from '@/components/modals/SettingsModal';
import { ShortcutsModal } from '@/components/modals/ShortcutsModal';
import { MediaInfoModal } from '@/components/modals/MediaInfoModal';
import { RecentFilesModal } from '@/components/modals/RecentFilesModal';
import { EqualizerModal } from '@/components/modals/EqualizerModal';

export default function Home() {
  return (
    <main className="h-screen w-screen bg-dark-950 dark:bg-dark-950 light:bg-gray-100 overflow-hidden relative">
      {/* Main Video Player */}
      <VideoPlayer />

      {/* Playlist Sidebar */}
      <Playlist />

      {/* Modals */}
      <SettingsModal />
      <ShortcutsModal />
      <MediaInfoModal />
      <RecentFilesModal />
      <EqualizerModal />
    </main>
  );
}
