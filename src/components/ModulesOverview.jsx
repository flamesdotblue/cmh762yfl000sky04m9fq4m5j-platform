import React from 'react';
import { Type, Mic, Image as ImageIcon, Camera } from 'lucide-react';

const items = [
  {
    icon: Type,
    title: 'Text Analysis',
    desc: 'Detects emotion from written content using lexical cues and heuristics.',
    href: '#analyze',
  },
  {
    icon: Mic,
    title: 'Audio Analysis',
    desc: 'Records speech, converts to text (if supported), and estimates tone and energy.',
    href: '#analyze',
  },
  {
    icon: ImageIcon,
    title: 'Image Analysis',
    desc: 'Identifies facial regions and infers expressions (face detection if available).',
    href: '#analyze',
  },
  {
    icon: Camera,
    title: 'Video Analysis',
    desc: 'Real-time webcam emotion cues with optional face detection when supported.',
    href: '#analyze',
  },
];

export default function ModulesOverview() {
  return (
    <section id="modules" className="py-16">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-semibold md:text-3xl">Analysis Modules</h2>
          <p className="mt-2 max-w-2xl text-white/70">
            Four dedicated modules work together to provide a robust, context-aware understanding of human emotions.
          </p>
        </div>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((it) => (
          <a
            key={it.title}
            href={it.href}
            className="group rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-white/20 hover:bg-white/10"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-white/10 p-2">
                <it.icon className="h-5 w-5" />
              </div>
              <h3 className="font-medium">{it.title}</h3>
            </div>
            <p className="mt-3 text-sm text-white/70">{it.desc}</p>
            <div className="mt-4 text-xs text-white/50">Learn more →</div>
          </a>
        ))}
      </div>
    </section>
  );
}
