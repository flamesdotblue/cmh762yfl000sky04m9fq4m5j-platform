import React from 'react';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-neutral-950/70">
      <div className="mx-auto max-w-7xl px-6 py-10 text-sm text-white/60 md:px-8">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="font-medium text-white">Multimodal Emotion Recognition</div>
            <div className="mt-1">A demo interface showcasing text, audio, image, and video emotion cues.</div>
          </div>
          <div className="text-white/50">Built with React, Vite, Tailwind, and Spline</div>
        </div>
      </div>
    </footer>
  );
}
