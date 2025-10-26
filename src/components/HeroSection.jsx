import React from 'react';
import Spline from '@splinetool/react-spline';
import { Brain, Rocket } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative h-[70vh] w-full overflow-hidden">
      <div className="absolute inset-0">
        <Spline scene="https://prod.spline.design/4cHQr84zOGAHOehh/scene.splinecode" style={{ width: '100%', height: '100%' }} />
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(131,88,255,0.35),rgba(255,127,80,0.15)_40%,rgba(0,0,0,0.85)_70%)]" />

      <div className="relative z-10 flex h-full flex-col items-center justify-center text-center px-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80 backdrop-blur">
          <Brain className="h-4 w-4" />
          Multimodal Emotion AI
        </div>
        <h1 className="mt-4 max-w-4xl text-balance text-4xl font-semibold md:text-6xl">
          Understand Human Emotions Across Text, Audio, Image, and Video
        </h1>
        <p className="mt-4 max-w-2xl text-pretty text-white/70 md:text-lg">
          A context-aware emotion recognition system that enhances human-computer interaction by interpreting emotions across multiple input types.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a href="#analyze" className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 font-medium text-neutral-900 transition hover:bg-white/90">
            <Rocket className="h-4 w-4" />
            Start Analyzing
          </a>
          <a href="#modules" className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-4 py-2 font-medium text-white transition hover:bg-white/10">
            Explore Modules
          </a>
        </div>
      </div>
    </section>
  );
}
