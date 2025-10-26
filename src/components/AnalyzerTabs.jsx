import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Type, Mic, Image as ImageIcon, Camera, Play, Square, Upload } from 'lucide-react';

function Badge({ label, tone = 'default' }) {
  const toneMap = {
    default: 'bg-white/10 text-white',
    positive: 'bg-emerald-500/20 text-emerald-300',
    negative: 'bg-red-500/20 text-red-300',
    neutral: 'bg-sky-500/20 text-sky-300',
    high: 'bg-fuchsia-500/20 text-fuchsia-300',
    low: 'bg-amber-500/20 text-amber-300',
  };
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${toneMap[tone] || toneMap.default}`}>{label}</span>;
}

function SectionCard({ title, icon: Icon, children, id }) {
  return (
    <section id={id} className="rounded-2xl border border-white/10 bg-white/5 p-4 md:p-6">
      <div className="mb-4 flex items-center gap-2">
        <div className="rounded-lg bg-white/10 p-2"><Icon className="h-5 w-5" /></div>
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      {children}
    </section>
  );
}

// Simple lexical emotion heuristic for text
function analyzeTextEmotion(text) {
  const t = text.toLowerCase();
  const emotions = {
    joy: ['happy', 'joy', 'excited', 'glad', 'love', 'amazing', 'great', 'awesome', 'wonderful'],
    sadness: ['sad', 'down', 'unhappy', 'depressed', 'cry', 'lonely', 'miserable'],
    anger: ['angry', 'mad', 'furious', 'annoyed', 'rage', 'irritated', 'hate'],
    fear: ['afraid', 'scared', 'fear', 'terrified', 'nervous', 'anxious'],
    surprise: ['surprised', 'shocked', 'wow', 'unexpected'],
    disgust: ['disgust', 'gross', 'nasty', 'repulsed'],
  };
  const counts = Object.fromEntries(Object.keys(emotions).map((k) => [k, 0]));
  for (const [emo, words] of Object.entries(emotions)) {
    for (const w of words) {
      const re = new RegExp(`\\b${w}\\b`, 'g');
      const m = t.match(re);
      counts[emo] += m ? m.length : 0;
    }
  }
  const best = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  const label = best && best[1] > 0 ? best[0] : 'neutral';
  return { label, counts };
}

function TextAnalyzer() {
  const [text, setText] = useState('I am excited but a bit nervous about the presentation!');
  const result = useMemo(() => analyzeTextEmotion(text), [text]);

  const tone = result.label === 'neutral' ? 'neutral' : ['joy'].includes(result.label) ? 'positive' : 'negative';

  return (
    <div className="space-y-3">
      <textarea
        className="min-h-[120px] w-full resize-y rounded-lg border border-white/10 bg-neutral-900/70 p-3 outline-none ring-0 placeholder:text-white/40 focus:border-white/20"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type or paste text here..."
      />
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span>Detected emotion:</span>
        <Badge label={result.label} tone={tone} />
      </div>
      <div className="text-xs text-white/60">This is a lightweight lexical heuristic for demo purposes.</div>
    </div>
  );
}

function AudioAnalyzer() {
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [level, setLevel] = useState(0);
  const mediaStreamRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const rafRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    return () => {
      stopAll();
    };
    // eslint-disable-next-line
  }, []);

  function stopAll() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (analyserRef.current) analyserRef.current.disconnect();
    if (audioCtxRef.current) audioCtxRef.current.close();
    if (mediaStreamRef.current) mediaStreamRef.current.getTracks().forEach((t) => t.stop());
    if (recognitionRef.current) {
      recognitionRef.current.onresult = null;
      recognitionRef.current.onend = null;
      try { recognitionRef.current.stop(); } catch {}
    }
    mediaStreamRef.current = null;
    audioCtxRef.current = null;
    analyserRef.current = null;
    recognitionRef.current = null;
    setRecording(false);
  }

  async function start() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      analyserRef.current = analyser;
      source.connect(analyser);

      const data = new Uint8Array(analyser.frequencyBinCount);
      const loop = () => {
        analyser.getByteTimeDomainData(data);
        // Compute RMS for loudness proxy
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
          const v = (data[i] - 128) / 128;
          sum += v * v;
        }
        const rms = Math.sqrt(sum / data.length);
        setLevel(rms);
        rafRef.current = requestAnimationFrame(loop);
      };
      loop();

      // Optional: Speech-to-text
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SR) {
        const recog = new SR();
        recog.continuous = true;
        recog.interimResults = true;
        recog.lang = 'en-US';
        recognitionRef.current = recog;
        recog.onresult = (e) => {
          let t = '';
          for (let i = e.resultIndex; i < e.results.length; i++) {
            t += e.results[i][0].transcript + (e.results[i].isFinal ? ' ' : '');
          }
          setTranscript((prev) => (t.trim().length > 0 ? t : prev));
        };
        recog.start();
      } else {
        setTranscript('(Speech recognition not supported in this browser)');
      }

      setRecording(true);
    } catch (e) {
      console.error(e);
      setTranscript('Microphone access denied or unavailable.');
    }
  }

  function stop() {
    stopAll();
  }

  const arousal = level > 0.1 ? 'high' : level > 0.05 ? 'medium' : 'low';

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        {!recording ? (
          <button onClick={start} className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-black transition hover:bg-emerald-400">
            <Play className="h-4 w-4" /> Start Recording
          </button>
        ) : (
          <button onClick={stop} className="inline-flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-400">
            <Square className="h-4 w-4" /> Stop
          </button>
        )}
        <div className="text-sm text-white/70">Arousal level:</div>
        <Badge label={arousal} tone={arousal === 'high' ? 'high' : arousal === 'low' ? 'low' : 'neutral'} />
        <div className="h-2 w-40 overflow-hidden rounded bg-white/10">
          <div className="h-full bg-emerald-400" style={{ width: `${Math.min(100, Math.round(level * 200))}%` }} />
        </div>
      </div>
      <div>
        <div className="text-xs text-white/50 mb-1">Transcript</div>
        <div className="min-h-[48px] rounded-lg border border-white/10 bg-neutral-900/70 p-3 text-sm text-white/80">
          {transcript || 'Say something to begin...'}
        </div>
      </div>
      <div className="text-xs text-white/60">Audio loudness estimated with RMS; transcript via Web Speech API when available.</div>
    </div>
  );
}

function ImageAnalyzer() {
  const [imgUrl, setImgUrl] = useState('');
  const [faces, setFaces] = useState([]);
  const [message, setMessage] = useState('Upload an image with a face to analyze.');
  const imgRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!imgUrl) return;
    const img = imgRef.current;
    if (!img) return;
    const onLoad = async () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0);

      if ('FaceDetector' in window) {
        try {
          const detector = new window.FaceDetector({ fastMode: true, maxDetectedFaces: 5 });
          const dets = await detector.detect(img);
          setFaces(dets);
          setMessage(`Detected ${dets.length} face(s).`);
          // Draw boxes
          ctx.lineWidth = 3;
          for (const d of dets) {
            ctx.strokeStyle = 'rgba(131,88,255,0.9)';
            ctx.strokeRect(d.boundingBox.x, d.boundingBox.y, d.boundingBox.width, d.boundingBox.height);
          }
        } catch (e) {
          console.warn('FaceDetector failed', e);
          setFaces([]);
          setMessage('Face detection failed. Showing image only.');
        }
      } else {
        setFaces([]);
        setMessage('FaceDetector API not supported. Showing image only.');
      }
    };
    if (img.complete) onLoad(); else img.onload = onLoad;
  }, [imgUrl]);

  function onFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setImgUrl(url);
  }

  // Very naive expression hint from brightness contrast
  const emotionHint = useMemo(() => {
    if (!canvasRef.current) return 'unknown';
    try {
      const ctx = canvasRef.current.getContext('2d');
      const { width, height } = canvasRef.current;
      if (!width || !height) return 'unknown';
      const data = ctx.getImageData(0, 0, width, height).data;
      let sum = 0;
      for (let i = 0; i < data.length; i += 4) {
        sum += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
      }
      const avg = sum / (data.length / 4) / 255;
      return avg > 0.6 ? 'surprise/joy-ish (bright)' : avg < 0.35 ? 'sad/neutral-ish (dark)' : 'neutral';
    } catch {
      return 'unknown';
    }
  }, [imgUrl, faces]);

  return (
    <div className="space-y-3">
      <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm transition hover:bg-white/10">
        <Upload className="h-4 w-4" />
        <span>Upload Image</span>
        <input onChange={onFile} type="file" accept="image/*" className="hidden" />
      </label>
      <div className="text-sm text-white/70">{message}</div>
      <div className="overflow-auto rounded-lg border border-white/10 bg-black/40 p-2">
        <div className="min-h-[200px]">
          {imgUrl ? (
            <div className="max-w-full">
              <img ref={imgRef} src={imgUrl} alt="uploaded" className="hidden" />
              <canvas ref={canvasRef} className="max-w-full h-auto" />
            </div>
          ) : (
            <div className="flex h-48 items-center justify-center text-white/50">No image selected</div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <span>Emotion hint:</span>
        <Badge label={emotionHint} tone={emotionHint.includes('joy') ? 'positive' : emotionHint.includes('sad') ? 'negative' : 'neutral'} />
      </div>
      <div className="text-xs text-white/60">Face highlighting uses the FaceDetector API when supported.</div>
    </div>
  );
}

function VideoAnalyzer() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [running, setRunning] = useState(false);
  const [hint, setHint] = useState('');
  const rafRef = useRef(null);

  useEffect(() => {
    return () => stop();
    // eslint-disable-next-line
  }, []);

  async function start() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setRunning(true);
      loop();
    } catch (e) {
      console.error(e);
      setHint('Camera access denied or unavailable.');
    }
  }

  function stop() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (videoRef.current?.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
    setRunning(false);
  }

  async function loop() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const w = video.videoWidth || 640;
    const h = video.videoHeight || 360;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');

    const draw = async () => {
      ctx.drawImage(video, 0, 0, w, h);

      // Optional face detection overlay
      if ('FaceDetector' in window) {
        try {
          const detector = new window.FaceDetector({ fastMode: true, maxDetectedFaces: 3 });
          const dets = await detector.detect(canvas);
          ctx.lineWidth = 3;
          ctx.strokeStyle = 'rgba(80,200,255,0.9)';
          dets.forEach((d) => ctx.strokeRect(d.boundingBox.x, d.boundingBox.y, d.boundingBox.width, d.boundingBox.height));
        } catch {}
      }

      // Brightness-based hint
      try {
        const imgData = ctx.getImageData(0, 0, w, h).data;
        let sum = 0;
        for (let i = 0; i < imgData.length; i += 4) {
          sum += 0.2126 * imgData[i] + 0.7152 * imgData[i + 1] + 0.0722 * imgData[i + 2];
        }
        const avg = sum / (imgData.length / 4) / 255;
        const hnt = avg > 0.6 ? 'bright (possible surprise/joy)' : avg < 0.35 ? 'dark (possible sadness/neutral)' : 'balanced (neutral)';
        setHint(hnt);
      } catch {}

      rafRef.current = requestAnimationFrame(draw);
    };
    draw();
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        {!running ? (
          <button onClick={start} className="inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-400">
            <Play className="h-4 w-4" /> Start Camera
          </button>
        ) : (
          <button onClick={stop} className="inline-flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-400">
            <Square className="h-4 w-4" /> Stop
          </button>
        )}
        <div className="text-sm text-white/70">Hint:</div>
        <Badge label={hint || 'waiting...'} tone={hint.includes('joy') ? 'positive' : hint.includes('sad') ? 'negative' : 'neutral'} />
      </div>
      <div className="overflow-hidden rounded-lg border border-white/10 bg-black/40">
        <canvas ref={canvasRef} className="block w-full" />
        <video ref={videoRef} className="hidden" playsInline muted />
      </div>
      <div className="text-xs text-white/60">Real-time processing in your browser. Face detection uses the FaceDetector API when available.</div>
    </div>
  );
}

export default function AnalyzerTabs() {
  const [tab, setTab] = useState('text');

  const tabs = [
    { id: 'text', label: 'Text', icon: Type },
    { id: 'audio', label: 'Audio', icon: Mic },
    { id: 'image', label: 'Image', icon: ImageIcon },
    { id: 'video', label: 'Video', icon: Camera },
  ];

  return (
    <section id="analyze" className="pb-24">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-semibold md:text-3xl">Multimodal Analyzer</h2>
          <p className="mt-2 max-w-2xl text-white/70">Switch between modalities to analyze emotions. All processing runs locally in your browser.</p>
        </div>
      </div>

      <div className="sticky top-0 z-10 mb-4 -mx-6 border-b border-white/10 bg-neutral-950/80 px-6 py-3 backdrop-blur md:mx-0 md:rounded-xl md:border md:px-4">
        <div className="flex flex-wrap items-center gap-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${tab === t.id ? 'bg-white text-neutral-900' : 'bg-white/5 text-white hover:bg-white/10'}`}
            >
              <t.icon className="h-4 w-4" /> {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {tab === 'text' && (
          <SectionCard id="text" title="Text Emotion Analysis" icon={Type}>
            <TextAnalyzer />
          </SectionCard>
        )}
        {tab === 'audio' && (
          <SectionCard id="audio" title="Audio Emotion Analysis" icon={Mic}>
            <AudioAnalyzer />
          </SectionCard>
        )}
        {tab === 'image' && (
          <SectionCard id="image" title="Image Emotion Analysis" icon={ImageIcon}>
            <ImageAnalyzer />
          </SectionCard>
        )}
        {tab === 'video' && (
          <SectionCard id="video" title="Video Emotion Analysis" icon={Camera}>
            <VideoAnalyzer />
          </SectionCard>
        )}

        {/* Context card */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.03] p-5">
          <h4 className="text-lg font-semibold">About Multimodal Emotion AI</h4>
          <p className="mt-2 text-sm text-white/70">
            Combining multiple input types reduces ambiguity and improves robustness. While this demo uses lightweight heuristics and on-device web APIs, a production system could integrate transformer models for text and audio, and CNN/ViT-based models for images and videos, then fuse predictions using late or hybrid fusion strategies.
          </p>
        </div>
      </div>
    </section>
  );
}
