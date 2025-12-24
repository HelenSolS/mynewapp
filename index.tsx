import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";
import { SIGILS_CANON, ElementType, SigilDef } from './sigils-canon';

const twa = (window as any).Telegram?.WebApp;
const aistudio = (window as any).aistudio;

const SketchPad = ({ onUpdate, disabled }: { onUpdate: (data: string | null) => void, disabled: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Инициализация стиля рисования
    ctx.strokeStyle = '#0ea5e9'; // Sky 500
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowBlur = 5;
    ctx.shadowColor = '#0ea5e9';
  }, []);

  const getXY = (e: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height)
    };
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
    if (e.cancelable) e.preventDefault(); // Останавливаем скролл
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
      if (twa?.HapticFeedback) twa.HapticFeedback.selectionChanged();
    }
  };

  return (
    <div className="relative w-full aspect-square bg-slate-950 border border-white/10 rounded-3xl overflow-hidden shadow-[0_0_50px_-12px_rgba(14,165,233,0.2)]">
      <canvas
        ref={canvasRef}
        width={1024}
        height={1024}
        className="w-full h-full"
        onMouseDown={start}
        onMouseMove={move}
        onMouseUp={stop}
        onMouseLeave={stop}
        onTouchStart={start}
        onTouchMove={move}
        onTouchEnd={stop}
      />
      <div className="absolute top-4 left-6 pointer-events-none">
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-sky-500/40">Altar Hub</span>
      </div>
      <button 
        onClick={clear}
        disabled={disabled}
        className="absolute bottom-6 right-6 bg-slate-900/80 backdrop-blur-xl border border-white/5 px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 active:scale-95 transition-all disabled:opacity-0"
      >
        Reset
      </button>
    </div>
  );
};

const App = () => {
  const [loading, setLoading] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [sketch, setSketch] = useState<string | null>(null);
  const [element, setElement] = useState<ElementType>('Огонь');
  const [selectedSigil, setSelectedSigil] = useState<SigilDef>(SIGILS_CANON.find(s => s.element === 'Огонь')!);

  useEffect(() => {
    if (twa) {
      twa.ready();
      twa.expand();
      twa.setHeaderColor('#020617');
    }
  }, []);

  const handleSynthesis = async () => {
    setLoading(true);
    try {
      if (aistudio && !(await aistudio.hasSelectedApiKey())) {
        await aistudio.openSelectKey();
      }

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
      
      const prompt = `
        PROFESSIONAL RITUAL SIGIL ART PIECE.
        Core geometry base: Provided user sketch.
        Canon Template: "${selectedSigil.name}".
        Elemental Affinity: ${element}.
        Symbol Characteristics: ${selectedSigil.tz}.
        Energy Aura: ${selectedSigil.aura}.
        
        Creative Task: Take the user's hand-drawn sketch and transform it into a perfectly symmetrical, high-fidelity arcane sigil. 
        Visual Style: Cinematic occultism, glowing neon energy lines, intricate sacred geometry patterns, photorealistic stone or metal textures, isolated on a deep pitch-black background. 
        Resolution: 8k masterpiece.
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
      if (err.message?.includes('Requested entity was not found') && aistudio) {
        await aistudio.openSelectKey();
      } else {
        twa?.showAlert("Synthesis error. Verify your connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (resultImage) {
    return (
      <div className="flex flex-col h-full bg-black safe-top safe-bottom animate-in fade-in zoom-in duration-700">
        <div className="flex-1 flex items-center justify-center p-6">
          <img src={resultImage} className="w-full max-w-[600px] rounded-3xl shadow-[0_0_80px_-20px_rgba(14,165,233,0.5)] border border-white/10" alt="Generated Sigil" />
        </div>
        <div className="p-8">
          <button 
            onClick={() => {
              setResultImage(null);
              if (twa?.HapticFeedback) twa.HapticFeedback.impactOccurred('medium');
            }}
            className="w-full py-5 bg-white/5 border border-white/10 text-white rounded-2xl font-black uppercase tracking-[0.3em] text-[11px] active:bg-white/10 transition-all"
          >
            Return to Altar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#020617] text-white safe-top safe-bottom overflow-hidden font-sans">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 flex justify-between items-end border-b border-white/5">
        <div>
          <h1 className="text-2xl font-black uppercase italic tracking-tighter leading-none">Sigil<span className="text-sky-500">Craft</span></h1>
          <p className="text-[8px] font-bold text-slate-500 uppercase tracking-[0.5em] mt-1.5 ml-0.5">Elite TMA Protocol</p>
        </div>
        <div className="flex flex-col items-end">
          <div className="w-2 h-2 rounded-full bg-sky-500 animate-pulse shadow-[0_0_8px_#0ea5e9]"></div>
          <span className="text-[9px] font-black text-sky-500/60 mt-1 uppercase">Active</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
        {/* Canvas Section */}
        <div className="p-6">
          <SketchPad onUpdate={setSketch} disabled={loading} />
          <div className="mt-4 flex justify-center">
             <span className="text-[9px] uppercase font-bold text-slate-600 tracking-[0.2em] bg-white/5 px-4 py-1.5 rounded-full border border-white/5">
               Draw the Sigil Structure Above
             </span>
          </div>
        </div>

        {/* Elements Selector */}
        <div className="px-6 flex gap-4 overflow-x-auto no-scrollbar border-y border-white/5 bg-black/20 py-4 mb-2">
          {['Воздух', 'Вода', 'Огонь', 'Земля', 'Эфир', 'Плетение'].map((el) => (
            <button
              key={el}
              onClick={() => {
                setElement(el as any);
                setSelectedSigil(SIGILS_CANON.find(s => s.element === el)!);
                if (twa?.HapticFeedback) twa.HapticFeedback.selectionChanged();
              }}
              className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                element === el ? 'text-sky-500 bg-sky-500/10' : 'text-slate-600'
              }`}
            >
              {el}
            </button>
          ))}
        </div>

        {/* Sigils Grid */}
        <div className="px-6 grid grid-cols-2 gap-3 pb-10">
          {SIGILS_CANON.filter(s => s.element === element).map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setSelectedSigil(s);
                if (twa?.HapticFeedback) twa.HapticFeedback.selectionChanged();
              }}
              className={`p-4 rounded-2xl text-left border transition-all duration-300 ${
                selectedSigil.id === s.id 
                  ? 'bg-sky-500 border-sky-400 text-black shadow-[0_0_30px_-10px_#0ea5e9]' 
                  : 'bg-white/5 border-white/5 text-slate-400'
              }`}
            >
              <div className="text-[10px] font-black uppercase truncate tracking-tight">{s.name}</div>
              <div className={`text-[8px] mt-1 font-mono ${selectedSigil.id === s.id ? 'text-black/60' : 'text-slate-600'}`}>
                ARCHIVE-0{s.id}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Synthesis Bar */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-[#020617]/80 backdrop-blur-2xl border-t border-white/10 safe-bottom">
        <div className="mb-3 flex justify-between items-center text-[9px] font-bold uppercase tracking-[0.2em]">
          <span className="text-slate-500">Vessel: <span className="text-white">{selectedSigil.name}</span></span>
          <span className="text-sky-500">{element}</span>
        </div>
        <button 
          onClick={handleSynthesis}
          disabled={loading}
          className="w-full py-5 bg-sky-500 text-black rounded-2xl font-black uppercase text-xs tracking-[0.5em] shadow-xl shadow-sky-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale overflow-hidden relative"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
               <div className="w-3 h-3 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
               Synthesizing...
            </span>
          ) : 'Initiate Synthesis'}
        </button>
      </div>

      {/* Global Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-[100] flex flex-col items-center justify-center animate-in fade-in duration-500">
          <div className="relative">
            <div className="w-24 h-24 border-2 border-sky-500/10 border-t-sky-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 border border-sky-500/20 rounded-full animate-ping"></div>
            </div>
          </div>
          <p className="mt-8 text-[10px] font-black uppercase tracking-[0.8em] text-sky-500 animate-pulse">Aligning Realities</p>
        </div>
      )}
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
