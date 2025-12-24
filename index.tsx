import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";
import { SIGILS_CANON, ElementType, SigilDef } from './sigils-canon';

const twa = (window as any).Telegram?.WebApp;
const aistudio = (window as any).aistudio;

type ArtStyle = 'Ancient' | 'Cyber' | 'Liquid' | 'Etheric';
type RitualMood = 'Divine' | 'Dark' | 'Cosmic';

const SketchPad = ({ onExport, isActive }: { onExport: (base64: string | null) => void, isActive: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    // Добавляем свечение линии для "магического" эффекта
    ctx.shadowBlur = 8;
    ctx.shadowColor = 'rgba(56, 189, 248, 0.5)';
  }, []);

  const getPos = (e: any) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    const clientX = e.clientX || e.touches?.[0]?.clientX;
    const clientY = e.clientY || e.touches?.[0]?.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const start = (e: any) => {
    if (!isActive) return;
    const { x, y } = getPos(e);
    const ctx = canvasRef.current?.getContext('2d');
    ctx?.beginPath();
    ctx?.moveTo(x, y);
    setIsDrawing(true);
  };

  const move = (e: any) => {
    if (!isDrawing || !isActive) return;
    const { x, y } = getPos(e);
    const ctx = canvasRef.current?.getContext('2d');
    ctx?.lineTo(x, y);
    ctx?.stroke();
  };

  const end = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    onExport(canvasRef.current?.toDataURL('image/png') || null);
  };

  const clear = () => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx && canvasRef.current) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      onExport(null);
    }
  };

  return (
    <div className="relative w-full h-full">
      <canvas 
        ref={canvasRef} 
        width={512} height={512}
        className="w-full h-full touch-none bg-black/20"
        onMouseDown={start} onMouseMove={move} onMouseUp={end}
        onTouchStart={start} onTouchMove={move} onTouchEnd={end}
      />
      <button 
        onClick={clear}
        className="absolute bottom-4 right-4 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/10 active:scale-95 transition-transform"
      >
        Clear Altar
      </button>
    </div>
  );
};

const App = () => {
  const [loading, setLoading] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [currentSketch, setCurrentSketch] = useState<string | null>(null);
  
  // Ritual State
  const [element, setElement] = useState<ElementType>('Огонь');
  const [selectedSigil, setSelectedSigil] = useState<SigilDef>(SIGILS_CANON.find(s => s.element === 'Огонь')!);
  const [style, setStyle] = useState<ArtStyle>('Cyber');
  const [mood, setMood] = useState<RitualMood>('Cosmic');
  const [energy, setEnergy] = useState(2);

  useEffect(() => {
    if (twa) {
      twa.ready();
      twa.setHeaderColor('#020617');
      twa.expand();
    }
  }, []);

  const initiateSynthesis = async () => {
    setLoading(true);
    try {
      if (aistudio && !(await aistudio.hasSelectedApiKey())) {
        await aistudio.openSelectKey();
      }

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

      const stylePrompts = {
        'Ancient': 'Ancient alchemical scroll, hand-drawn ink on aged parchment, gold leaf illuminated manuscript, ritualistic textures, 8k macro.',
        'Cyber': 'Futuristic holographic interface, neon glowing plasma lines, digital occultism, synthwave aesthetic, dark tech-void background.',
        'Liquid': 'Macro photography of liquid mercury and iridescent oils, metallic fluid geometry, surreal chrome reflections, flowing shapes.',
        'Etheric': 'Ethereal cosmic energy, gaseous nebula patterns, spirits made of light, translucent wispy forms, celestial radiance.'
      };

      const moodPrompts = {
        'Divine': 'Heavenly radiance, white-gold light, pure and peaceful energy.',
        'Dark': 'Obsidian shadows, cursed red energy, sinister and powerful atmosphere.',
        'Cosmic': 'Multidimensional colors, astronomical precision, infinite stardust.'
      };

      const finalPrompt = `
        High-fidelity transmutation of a ritual sketch.
        Concept: "${selectedSigil.name}" of the ${element} element.
        Canon Description: ${selectedSigil.tz}.
        Energy Aura: ${selectedSigil.aura}.
        Aesthetic: ${stylePrompts[style]}.
        Mood: ${moodPrompts[mood]}.
        Energy Intensity: ${energy}/3.
        Technical: Perfectly centered, isolated on pitch black background, photorealistic, 8k, symmetrical masterpiece.
      `;

      const contents: any = {
        parts: [{ text: finalPrompt }]
      };

      if (currentSketch) {
        contents.parts.push({
          inlineData: {
            data: currentSketch.split(',')[1],
            mimeType: 'image/png'
          }
        });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents,
        config: { imageConfig: { aspectRatio: "1:1" } }
      });

      const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
      if (part?.inlineData) {
        setResultImage(`data:image/png;base64,${part.inlineData.data}`);
        if (twa?.HapticFeedback) twa.HapticFeedback.notificationOccurred('success');
      }
    } catch (err) {
      console.error(err);
      if (twa) twa.showAlert("Synthesis interrupted. Check Aether connection.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResultImage(null);
    if (twa?.HapticFeedback) twa.HapticFeedback.impactOccurred('light');
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-[#020617] text-white overflow-hidden font-sans">
      
      {/* Header HUD */}
      <div className="px-5 pt-4 flex justify-between items-end border-b border-white/5 pb-3 bg-black/20">
        <div>
          <h1 className="text-xl font-black uppercase tracking-tighter italic">SigilCraft <span className="text-sky-500">Elite</span></h1>
          <p className="text-[7px] font-bold text-slate-500 uppercase tracking-[0.4em] mt-0.5">Automated Ritual Protocol</p>
        </div>
        <div className="text-right">
          <div className="text-[8px] font-mono text-sky-800 uppercase">Resonance</div>
          <div className="text-xs font-black text-sky-400">{(energy * 33.3).toFixed(1)}%</div>
        </div>
      </div>

      {/* Main Altar / Viewport */}
      <div className="flex-1 relative bg-black flex items-center justify-center">
        {!resultImage ? (
          <SketchPad onExport={setCurrentSketch} isActive={!loading} />
        ) : (
          <div className="w-full h-full relative group animate-in fade-in zoom-in duration-1000">
            <img src={resultImage} className="w-full h-full object-cover" alt="Artifact" />
            <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black to-transparent">
               <button 
                onClick={reset}
                className="w-full py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] active:scale-95 transition-transform"
               >
                 Dismiss Artifact
               </button>
            </div>
          </div>
        )}

        {loading && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xl z-50 flex flex-col items-center justify-center">
            <div className="w-20 h-20 relative">
               <div className="absolute inset-0 border-4 border-sky-500/10 rounded-full"></div>
               <div className="absolute inset-0 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="mt-8 text-[9px] font-black uppercase tracking-[0.5em] text-sky-500 animate-pulse">Transmuting Essence...</p>
          </div>
        )}
      </div>

      {/* Configuration Core */}
      <div className="bg-[#020617] border-t border-white/5 p-5 space-y-4">
        
        {/* Sigil Selection */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Select Canon</span>
            <div className="flex gap-2">
              {['Воздух', 'Вода', 'Огонь', 'Земля', 'Эфир', 'Плетение'].map(el => (
                <button 
                  key={el}
                  onClick={() => {
                    setElement(el as any);
                    setSelectedSigil(SIGILS_CANON.find(s => s.element === el)!);
                  }}
                  className={`w-1.5 h-1.5 rounded-full ${element === el ? 'bg-sky-500 shadow-[0_0_8px_#38bdf8]' : 'bg-white/10'}`}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {SIGILS_CANON.filter(s => s.element === element).map(s => (
              <button 
                key={s.id}
                onClick={() => setSelectedSigil(s)}
                className={`px-4 py-2 rounded-xl text-[10px] font-bold whitespace-nowrap border transition-all ${
                  selectedSigil.id === s.id 
                    ? 'bg-sky-500 border-sky-400 text-black shadow-lg shadow-sky-500/20' 
                    : 'bg-white/5 border-white/5 text-slate-500'
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>

        {/* Detailed Controls */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <span className="text-[8px] font-black uppercase text-slate-600 tracking-widest block">Style</span>
            <div className="grid grid-cols-2 gap-1">
              {['Cyber', 'Ancient', 'Liquid', 'Etheric'].map(s => (
                <button 
                  key={s} onClick={() => setStyle(s as any)}
                  className={`py-2 rounded-lg text-[8px] font-bold uppercase ${style === s ? 'bg-white text-black' : 'bg-white/5 text-slate-500'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <span className="text-[8px] font-black uppercase text-slate-600 tracking-widest block">Ritual Mood</span>
            <div className="space-y-1">
              {['Cosmic', 'Divine', 'Dark'].map(m => (
                <button 
                  key={m} onClick={() => setMood(m as any)}
                  className={`w-full py-1.5 px-3 rounded-lg text-[8px] font-bold uppercase flex justify-between items-center ${
                    mood === m ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30' : 'bg-white/5 text-slate-500'
                  }`}
                >
                  {m} <span className="opacity-30">✦</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Energy Bar */}
        <div className="pt-2">
          <div className="flex justify-between items-center mb-2">
             <span className="text-[8px] font-black uppercase text-slate-600 tracking-widest">Energy level</span>
             <span className="text-sky-500 font-mono text-[9px]">LEVEL_0{energy}</span>
          </div>
          <div className="flex gap-1 h-1.5">
            {[1, 2, 3].map(v => (
              <div 
                key={v}
                onClick={() => setEnergy(v)}
                className={`flex-1 rounded-full cursor-pointer transition-all ${energy >= v ? 'bg-sky-500' : 'bg-white/10'}`}
              />
            ))}
          </div>
        </div>

        {/* Action Button */}
        <button 
          onClick={initiateSynthesis}
          disabled={loading || resultImage !== null}
          className="w-full py-5 bg-sky-500 text-black rounded-2xl font-black uppercase text-xs tracking-[0.4em] shadow-[0_0_30px_rgba(56,189,248,0.3)] active:scale-95 transition-all disabled:opacity-30 disabled:grayscale mt-2"
        >
          {loading ? 'Synthesizing...' : 'Initiate Synthesis'}
        </button>
      </div>

      {/* Safe Area Footer */}
      <div className="h-4 bg-[#020617]"></div>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
