# 🎬 GIF Maker

A beautiful, privacy-focused video to GIF converter that runs entirely in your browser. No uploads, no servers – just pure client-side magic powered by FFmpeg.wasm.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss)

## ✨ Features

- **100% Private** – All processing happens locally in your browser. Nothing is uploaded to any server.
- **High Quality** – Uses FFmpeg's optimized palette generation for crisp, vibrant GIFs.
- **Customizable** – Control FPS (5-30), output width (240-1280px), and trim duration.
- **Beautiful UI** – Modern glassmorphism design with dark/light mode support.
- **Mobile Friendly** – Responsive layout that works on all screen sizes.
- **Drag & Drop** – Simply drop your video file to get started.

## 🚀 Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm, yarn, or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/video-to-gif.git
cd video-to-gif

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

## 🎯 Usage

1. **Upload** – Drag and drop a video file (MP4, MOV, or WebM up to 100MB) or click to browse.
2. **Configure** – Adjust frame rate, output width, and trim the video duration.
3. **Convert** – Click "Convert to GIF" and watch the progress.
4. **Download** – Save your GIF or convert another video!

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| [Next.js 16](https://nextjs.org/) | React framework with App Router |
| [React 19](https://react.dev/) | UI library |
| [TypeScript](https://www.typescriptlang.org/) | Type safety |
| [Tailwind CSS 4](https://tailwindcss.com/) | Styling |
| [FFmpeg.wasm](https://ffmpegwasm.netlify.app/) | Video processing |
| [Radix UI](https://www.radix-ui.com/) | Accessible components |
| [Lucide](https://lucide.dev/) | Icons |
| [next-themes](https://github.com/pacocoursey/next-themes) | Dark mode |

## ⚙️ Configuration

The app uses special HTTP headers for SharedArrayBuffer support (required by FFmpeg.wasm). These are configured in `next.config.ts`:

```typescript
headers: [
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Embedder-Policy", value: "require-corp" }
]
```

## 📁 Project Structure

```
src/
├── app/
│   ├── globals.css      # Global styles & CSS variables
│   ├── layout.tsx       # Root layout with theme provider
│   └── page.tsx         # Main application page
├── components/
│   ├── progress-display.tsx  # Conversion progress bar
│   ├── result-view.tsx       # GIF preview & download
│   ├── settings-panel.tsx    # FPS, width, trim controls
│   ├── theme-provider.tsx    # Dark/light mode wrapper
│   ├── theme-toggle.tsx      # Theme switch button
│   └── upload-zone.tsx       # Drag & drop file input
└── lib/
    ├── ffmpeg.ts        # FFmpeg initialization & conversion logic
    └── utils.ts         # Helper functions
```

## 🌐 Browser Support

Requires a browser with SharedArrayBuffer support:
- Chrome 92+
- Firefox 79+
- Safari 15.2+
- Edge 92+

## 📄 License

MIT License – feel free to use this project for personal or commercial purposes.

---

<p align="center">
  Built with 💜 using FFmpeg.wasm
</p>
