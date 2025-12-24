# MOVIX - Web Media Player

A powerful, modern media player built with Next.js, featuring a sleek VLC-inspired design with advanced features like audio equalizer, A-B loop, screenshot capture, and theme customization.

![MOVIX](https://img.shields.io/badge/MOVIX-Media%20Player-orange)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-cyan) 

## Features

### Core Playback
- Play/Pause, Stop, Previous/Next track
- Seek forward/backward with keyboard or click
- Variable playback speed (0.25x - 2x)
- Loop single track or entire playlist
- Shuffle mode
- Resume from last position

### Audio
- Volume control with visual slider
- Mute/Unmute toggle
- **10-Band Audio Equalizer** with presets (Rock, Pop, Jazz, Classical, Electronic, Hip-Hop, etc.)
- Real-time audio processing via Web Audio API

### Video
- Fullscreen mode
- Picture-in-Picture support
- **Screenshot Capture** - Save any frame as PNG
- Multiple aspect ratios (Auto, 16:9, 4:3, 21:9, 1:1)
- Video effects:
  - Brightness
  - Contrast
  - Saturation
  - Hue rotation
  - Blur

### Advanced Features
- **A-B Loop** - Loop any section of video for practice or review
- **Recent Files History** - Quick access to previously played media (up to 20 files)
- **Theme Support** - Light, Dark, and System themes

### Subtitles
- Support for SRT, VTT, ASS/SSA formats
- Adjustable subtitle delay
- Multiple subtitle sizes (Small, Medium, Large)
- Customizable subtitle colors
- Optional background for better readability

### Playlist
- Add multiple files at once
- Drag and drop support
- Search within playlist
- Visual now-playing indicator
- Total duration display
- Remove individual items

### User Interface
- Modern dark/light themes with orange accents
- Smooth Framer Motion animations
- Auto-hiding controls during playback
- On-screen display (OSD) notifications
- Responsive design
- Glass morphism effects

## Keyboard Shortcuts

### Playback
| Key | Action |
|-----|--------|
| Space / K | Play / Pause |
| ← | Seek -10 seconds |
| → | Seek +10 seconds |
| Shift + ← | Seek -1 minute |
| Shift + → | Seek +1 minute |
| J | Seek -10 seconds |
| L | Seek +10 seconds |
| 0-9 | Seek to 0%-90% |
| Home | Go to start |
| End | Go to end |
| P | Previous track |
| Shift + N | Next track |
| R | Toggle loop |
| B | A-B Loop (set points/clear) |
| Shift + S | Toggle shuffle |

### Volume
| Key | Action |
|-----|--------|
| ↑ | Volume up |
| ↓ | Volume down |
| M | Mute / Unmute |

### Speed
| Key | Action |
|-----|--------|
| > or . | Increase speed |
| < or , | Decrease speed |

### Display & Tools
| Key | Action |
|-----|--------|
| F | Toggle fullscreen |
| S | Take screenshot |
| E | Open equalizer |
| Esc | Exit fullscreen |
| Ctrl + L | Toggle playlist |
| Ctrl + I | Media information |
| ? or F1 | Show shortcuts |

### Subtitles
| Key | Action |
|-----|--------|
| C | Toggle subtitles |
| G | Subtitle delay -50ms |
| H | Subtitle delay +50ms |

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/movix.git
cd movix

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## Project Structure

```
movix/
├── src/
│   ├── app/
│   │   ├── globals.css        # Global styles with theme support
│   │   ├── layout.tsx         # Root layout with ThemeProvider
│   │   └── page.tsx           # Main page
│   ├── components/
│   │   ├── player/
│   │   │   ├── VideoPlayer.tsx
│   │   │   ├── Controls.tsx
│   │   │   └── OSD.tsx
│   │   ├── playlist/
│   │   │   └── Playlist.tsx
│   │   ├── modals/
│   │   │   ├── SettingsModal.tsx
│   │   │   ├── ShortcutsModal.tsx
│   │   │   ├── MediaInfoModal.tsx
│   │   │   ├── RecentFilesModal.tsx
│   │   │   └── EqualizerModal.tsx
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Slider.tsx
│   │   │   └── Tooltip.tsx
│   │   └── ThemeProvider.tsx
│   ├── hooks/
│   │   ├── useKeyboardShortcuts.ts
│   │   └── useAudioEqualizer.ts
│   ├── stores/
│   │   └── playerStore.ts     # Zustand state management
│   ├── types/
│   │   └── index.ts
│   └── utils/
│       ├── helpers.ts
│       └── subtitleParser.ts
├── public/
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand (with persistence)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **UI Components**: Radix UI primitives
- **Audio Processing**: Web Audio API

## Browser Support

- Chrome 90+
- Firefox 90+
- Edge 90+
- Safari 15+

## Supported Formats

### Video
- MP4 (H.264, H.265)
- WebM (VP8, VP9)
- OGG (Theora)

### Audio
- MP3
- WAV
- OGG (Vorbis)
- AAC
- FLAC (browser dependent)

### Subtitles
- SRT (SubRip)
- VTT (WebVTT)
- ASS/SSA (Advanced SubStation Alpha)

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
