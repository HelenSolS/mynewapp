import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";

const SIGILS_CANON = [
  { id: 1, name: 'Whisper', element: 'Воздух', tz: 'Thin curved line splitting into two' },
  { id: 12, name: 'Ripple', element: 'Вода', tz: 'Concentric broken circles' },
  { id: 23, name: 'The Spark', element: 'Огонь', tz: 'Small cross with split ends' },
  { id: 34, name: 'Rootmark', element: 'Земля', tz: 'Y-shape branching downwards' },
  { id: 45, name: 'Fate Thread', element: 'Эфир', tz: 'Infinite vertical line' },
  { id: 56, name: 'Mirror Key', element: 'Плетение', tz: 'Two mirrored vertical L-shapes' },
  { id: 2, name: 'Gate of Winds', element: 'Воздух', tz: 'Parallel vertical lines, vortex center' },
  { id: 13, name: 'Deep Tide', element: 'Вода', tz: 'Two heavy interconnected waves' },
  { id: 25, name: 'Flare', element: 'Огонь', tz: 'Star-like burst' },
  { id: 58, name: 'The Knot', element: 'Плетение', tz: 'Endless loop' }
];

const ELEMENTS = ['Воздух', 'Вода', 'Огонь', 'Земля', 'Эфир', 'Плетение'];

const twa = (window as any).Telegram?.WebApp;

const SketchPad = ({ onUpdate, disabled }: { onUpdate: (data: string | null) => void, disabled: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#38bdf8';
  }, []);

  const getXY = (e: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
  };

  const start = (e: any) => {
    if (disabled) return;
    const { x, y } = getXY(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      setIsDrawing(true);
    }
  };

  const move = (e: any) => {
    if (!isDrawing || disabled) return;
    if (e.cancelable) e.preventDefault();
    const { x, y } = getXY(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stop = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    onUpdate(canvasRef.current?.toDataURL('image/png') || null);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      onUpdate(null);
      if (twa?.HapticFeedback) twa.HapticFeedback.impactOccurred('medium');
    }
  };

  return (
    <div className="relative w-full aspect-square bg-slate-900/40 border border-white/5 rounded-[2rem] overflow-hidden backdrop-blur-sm shadow-2xl">
      <canvas
        ref={canvasRef}
        width={1000}
        height={1000}
        className="w-full h-full cursor-crosshair"
        onMouseDown={start}
        onMouseMove={move}
        onMouseUp={stop}
        onMouseLeave={stop}
        onTouchStart={start}
        onTouchMove={move}
        onTouchEnd={stop}
      />
      <button 
        onClick={clear}
        disabled={disabled}
        className="absolute bottom-6 right-6 bg-white/5 hover:bg-white/10 border border-white/10 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-90 disabled:opacity-0"
      >
        Reset Altar
      </button>
    </div>
  );
};

const App = () => {
  const [loading, setLoading] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [sketch, setSketch] = useState<string | null>(null);
  const [element, setElement] = useState(ELEMENTS[2]);
  const [selectedSigil, setSelectedSigil] = useState(SIGILS_CANON.find(s => s.element === ELEMENTS[2])!);

  useEffect(() => {
    if (twa) {
      twa.ready();
      twa.expand();
      twa.setHeaderColor('#020617');
    }
  }, []);

  const handleSynthesis = async () => {
    if (loading) return;
    setLoading(true);
    
    try {
      // Инициализация ключа через стандартный механизм AI Studio
      const aistudio = (window as any).aistudio;
      if (aistudio && !(await aistudio.hasSelectedApiKey())) {
        await aistudio.openSelectKey();
        // После открытия диалога продолжаем, предполагая успех (согласно правилам)
      }

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
      
      const prompt = `
        PROFESSIONAL ARCANE ARTIFACT. 
        Input structure: Hand-drawn user sketch provided as base image.
        Archetype: "${selectedSigil.name}" of the ${element} element.
        Visual Style: High-fidelity ritual sigil glowing with vivid blue ethereal energy.
        Background: Deep obsidian black stone surface, cinematic lighting, magical dust.
        Final: 8k resolution, perfectly symmetrical, mystical artifact.
      `;

      const parts: any[] = [{ text: prompt }];
      if (sketch) {
        parts.push({
          inlineData: {
            data: sketch.split(',')[1],
            mimeType: 'image/png'
          }
        });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts },
        config: { imageConfig: { aspectRatio: "1:1" } }
      });

      const imagePart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
      if (imagePart?.inlineData) {
        setResultImage(`data:image/png;base64,${imagePart.inlineData.data}`);
        if (twa?.HapticFeedback) twa.HapticFeedback.notificationOccurred('success');
      }
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes('Requested entity was not found')) {
        const aistudio = (window as any).aistudio;
        if (aistudio) await aistudio.openSelectKey();
      } else {
        twa?.showAlert("Synthesis unstable. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (resultImage) {
    return (
      <div className="flex flex-col h-full bg-[#020617] p-8 animate-in fade-in duration-500 overflow-y-auto">
        <div className="flex-1 flex items-center justify-center">
          <img src={resultImage} className="w-full max-w-[500px] rounded-[2.5rem] shadow-[0_0_80px_-20px_#0ea5e9] border border-white/10" alt="Artifact" />
        </div>
        <button 
          onClick={() => setResultImage(null)}
          className="mt-10 w-full py-6 bg-white/5 border border-white/10 rounded-[1.5rem] font-black uppercase tracking-[0.5em] text-[11px] transition-all active:scale-95"
        >
          Return to Altar
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#020617] text-white overflow-hidden">
      <div className="px-8 pt-10 pb-6 border-b border-white/5 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter leading-none">Sigil<span className="text-sky-500">Craft</span></h1>
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.6em] mt-2">Neural Altar v2.6</p>
        </div>
        <div className="w-2 h-2 bg-sky-500 rounded-full animate-pulse shadow-[0_0_10px_#0ea5e9]"></div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-36">
        <div className="p-8">
          <SketchPad onUpdate={setSketch} disabled={loading} />
        </div>

        <div className="px-8 flex gap-4 overflow-x-auto no-scrollbar py-2">
          {ELEMENTS.map((el) => (
            <button
              key={el}
              onClick={() => {
                setElement(el);
                const first = SIGILS_CANON.find(s => s.element === el);
                if (first) setSelectedSigil(first);
                if (twa?.HapticFeedback) twa.HapticFeedback.selectionChanged();
              }}
              className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                element === el ? 'bg-sky-500 border-sky-400 text-black' : 'bg-white/5 border-transparent text-slate-500'
              }`}
            >
              {el}
            </button>
          ))}
        </div>

        <div className="p-8 grid grid-cols-2 gap-4 pb-16">
          {SIGILS_CANON.filter(s => s.element === element).map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setSelectedSigil(s);
                if (twa?.HapticFeedback) twa.HapticFeedback.selectionChanged();
              }}
              className={`p-5 rounded-3xl text-left border transition-all duration-300 ${
                selectedSigil.id === s.id ? 'bg-sky-500/10 border-sky-500' : 'bg-white/5 border-transparent'
              }`}
            >
              <div className={`text-[11px] font-black uppercase truncate ${selectedSigil.id === s.id ? 'text-sky-400' : 'text-slate-500'}`}>
                {s.name}
              </div>
              <div className="text-[7px] font-mono text-slate-700 mt-2">ID: {s.id}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-8 bg-slate-950/90 backdrop-blur-3xl border-t border-white/5 safe-bottom">
        <button 
          onClick={handleSynthesis}
          disabled={loading}
          className="w-full py-6 bg-sky-500 text-black rounded-[1.5rem] font-black uppercase text-xs tracking-[0.6em] active:scale-[0.97] transition-all disabled:opacity-40"
        >
          {loading ? 'Synthesizing...' : 'Initiate Synthesis'}
        </button>
      </div>

      {loading && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-[100] flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-2 border-sky-500/20 border-t-sky-500 rounded-full animate-spin"></div>
          <p className="mt-8 text-[10px] font-black uppercase tracking-[1em] text-sky-500 animate-pulse">Aligning Matrix</p>
        </div>
      )}
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
