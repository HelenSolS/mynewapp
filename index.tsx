import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";
import { SIGILS_CANON, ElementType } from './sigils-canon';

// Принудительная отладка: выводим всё в консоль браузера
console.log("System: Script loaded");

const twa = (window as any).Telegram?.WebApp;
const aistudio = (window as any).aistudio;

const App = () => {
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [element, setElement] = useState<ElementType>('Воздух');
  const [logs, setLogs] = useState<string[]>(["[00:00:00] Booting SigilCraft..."]);
  const logEndRef = useRef<HTMLDivElement>(null);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs(prev => [...prev, `[${time}] ${msg}`].slice(-10));
    console.log(`[LOG] ${msg}`);
  };

  useEffect(() => {
    addLog("System: Контейнер отрисован");
    
    if (twa) {
      twa.ready();
      twa.expand();
      addLog("TWA: Telegram SDK Ready");
    } else {
      addLog("System: Web-режим (TWA не найден)");
    }
  }, []);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const simulateAction = () => {
    setLoading(true);
    addLog(`Ritual: Концентрация на стихии ${element}...`);
    
    setTimeout(() => {
      setLoading(false);
      addLog("Success: Форма стабилизирована");
      const samples = [
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400",
        "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=400"
      ];
      setImage(samples[Math.floor(Math.random() * samples.length)]);
      if (twa?.HapticFeedback) twa.HapticFeedback.impactOccurred('medium');
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full bg-[#020617] text-white p-6 overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-black italic tracking-tighter uppercase">SigilCraft</h1>
          <p className="text-[9px] text-sky-500 font-bold tracking-[0.3em] uppercase opacity-50">Experimental v1.3.3</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-sky-500/10 flex items-center justify-center border border-sky-500/20">
          <div className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></div>
        </div>
      </div>

      {/* Main Viewport */}
      <div className="flex-1 flex flex-col items-center justify-center space-y-8">
        <div className="relative w-full aspect-square max-w-[300px] group">
          <div className="absolute inset-0 bg-sky-500/10 blur-3xl rounded-full opacity-20 group-hover:opacity-40 transition-opacity"></div>
          <div className="relative w-full h-full bg-white/5 rounded-[3rem] border border-white/10 flex items-center justify-center overflow-hidden shadow-inner">
            {image ? (
              <img src={image} className="w-full h-full object-cover" alt="Sigil" />
            ) : (
              <div className="flex flex-col items-center opacity-20">
                <span className="text-5xl mb-2">✧</span>
                <p className="text-[8px] uppercase tracking-widest font-black">Scanning Aether</p>
              </div>
            )}
            
            {loading && (
              <div className="absolute inset-0 bg-[#020617]/90 backdrop-blur-sm flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-2 border-sky-500/20 border-t-sky-500 rounded-full animate-spin mb-4"></div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-sky-500 animate-pulse">Materializing...</div>
              </div>
            )}
          </div>
        </div>

        {/* Console / Logs */}
        <div className="w-full bg-black/40 rounded-2xl border border-white/5 p-4 font-mono text-[10px] h-32 overflow-y-auto no-scrollbar shadow-lg">
          <div className="flex justify-between items-center mb-2 border-b border-white/5 pb-1">
            <span className="text-sky-800 font-black uppercase tracking-widest text-[8px]">Aether_Terminal</span>
            <span className="text-[8px] opacity-30">ONLINE</span>
          </div>
          {logs.map((log, i) => (
            <div key={i} className="mb-1 text-slate-400">
              <span className="text-sky-500/50 mr-2">#</span>{log}
            </div>
          ))}
          <div ref={logEndRef} />
        </div>
      </div>

      {/* Controls */}
      <div className="mt-8 space-y-4">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {['Воздух', 'Вода', 'Огонь', 'Земля', 'Эфир'].map(el => (
            <button 
              key={el}
              onClick={() => { setElement(el as any); addLog(`Selected focus: ${el}`); }}
              className={`px-5 py-3 rounded-xl text-[10px] font-bold uppercase transition-all border ${
                element === el ? 'bg-sky-500 border-sky-500 text-black shadow-lg shadow-sky-500/20' : 'bg-white/5 border-white/10 text-slate-500'
              }`}
            >
              {el}
            </button>
          ))}
        </div>

        <button 
          onClick={simulateAction}
          disabled={loading}
          className="w-full py-6 bg-white text-black rounded-2xl uppercase text-xs font-black tracking-[0.2em] active:scale-[0.98] transition-all shadow-xl disabled:opacity-50"
        >
          {loading ? 'Communing...' : 'Cast Materialization'}
        </button>
      </div>

      <div className="h-4"></div>
    </div>
  );
};

// Рендерим приложение с обработкой ошибок
try {
  const rootElement = document.getElementById('root');
  if (!rootElement) throw new Error("Root element not found");
  
  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);
  console.log("System: React Rendered");
} catch (e: any) {
  console.error("Critical Render Error:", e);
  const display = document.getElementById('error-display');
  if (display) {
    display.style.display = 'block';
    display.innerHTML += `<div>[RENDER ERROR] ${e.message}</div>`;
  }
}
