import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";
import { SIGILS_CANON, ElementType } from './sigils-canon';

const twa = (window as any).Telegram?.WebApp;
const aistudio = (window as any).aistudio;

// РЕЖИМ СИМУЛЯЦИИ: Отключаем реальные запросы для первичной проверки интерфейса
const USE_REAL_API = false; 

const App = () => {
  const [loading, setLoading] = useState(false);
  const [hasKey, setHasKey] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [element, setElement] = useState<ElementType>('Воздух');
  const [logs, setLogs] = useState<string[]>([]);
  const logEndRef = useRef<HTMLDivElement>(null);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs(prev => [...prev, `[${time}] ${msg}`].slice(-12));
  };

  useEffect(() => {
    if (twa) {
      try {
        twa.ready();
        twa.expand();
        twa.headerColor = '#020617';
        twa.backgroundColor = '#020617';
        addLog("TWA: Сервисы активны");
      } catch (e) {
        addLog("TWA: Ошибка инициализации");
      }
    }

    const checkKeyStatus = async () => {
      if (aistudio) {
        try {
          const selected = await aistudio.hasSelectedApiKey();
          setHasKey(selected);
          addLog(selected ? "Auth: Ключ обнаружен" : "Auth: Режим демо");
        } catch (e) {
          addLog("Auth: Поиск ключа...");
        }
      }
    };
    
    checkKeyStatus();
    addLog("System: SigilCraft v1.3.2 READY");
  }, []);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleAction = async () => {
    if (loading) return;

    if (!USE_REAL_API) {
      simulateRitual();
      return;
    }

    if (!hasKey) {
      if (aistudio) {
        addLog("Auth: Запрос авторизации...");
        await aistudio.openSelectKey();
        setHasKey(true);
      } else {
        setError("API Key required");
      }
      return;
    }

    performRealRitual();
  };

  const simulateRitual = () => {
    setLoading(true);
    setError(null);
    setImage(null);
    addLog(`Ritual: Поток [${element}] открыт...`);
    
    setTimeout(() => {
      addLog("Ritual: Сборка структуры...");
      setTimeout(() => {
        addLog("Ritual: Визуализация...");
        setTimeout(() => {
          setLoading(false);
          addLog("Success: Сигил готов");
          const samples = [
            "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=400&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=400&auto=format&fit=crop"
          ];
          setImage(samples[Math.floor(Math.random() * samples.length)]);
          if (twa?.HapticFeedback) twa.HapticFeedback.notificationOccurred('success');
        }, 1000);
      }, 700);
    }, 500);
  };

  const performRealRitual = async () => {
    setLoading(true);
    setError(null);
    addLog(`Gemini: Запрос данных...`);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
      const elementSigils = SIGILS_CANON.filter(s => s.element === element);
      const targetSigil = elementSigils[Math.floor(Math.random() * elementSigils.length)];

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: `Mystic glowing sigil of ${targetSigil.name}, ${targetSigil.tz}, ${targetSigil.aura} energy, black background.` }] }
      });

      const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
      if (part?.inlineData) {
        setImage(`data:image/png;base64,${part.inlineData.data}`);
        addLog("Gemini: Успешно");
      }
    } catch (err: any) {
      addLog(`Error: ${err.message}`);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-[#020617] text-white p-6 overflow-hidden select-none fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-black italic tracking-tighter uppercase leading-none">SigilCraft</h1>
          <div className="flex items-center gap-1.5 mt-1">
            <div className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse"></div>
            <span className="text-[8px] font-bold uppercase tracking-widest text-slate-500">STABLE_RELEASE</span>
          </div>
        </div>
        <div className="text-[10px] text-sky-500 font-mono opacity-50 uppercase tracking-widest">Aether_OS</div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="relative w-full aspect-square max-w-[280px] bg-white/5 rounded-[2.5rem] border border-white/5 flex items-center justify-center shadow-2xl overflow-hidden">
          {image ? (
            <img src={image} className="w-full h-full object-cover animate-in fade-in duration-500" alt="Artifact" />
          ) : (
            <div className="text-center opacity-10 flex flex-col items-center">
              <div className="text-6xl mb-2">✦</div>
              <p className="text-[8px] uppercase tracking-[0.4em]">Ожидание Сигнала</p>
            </div>
          )}
          
          {loading && (
            <div className="absolute inset-0 bg-[#020617]/80 backdrop-blur-md flex flex-col items-center justify-center">
              <div className="w-10 h-10 border-2 border-sky-500/10 border-t-sky-500 rounded-full animate-spin mb-4"></div>
              <div className="text-[9px] font-black uppercase tracking-widest text-sky-500 animate-pulse">Summoning...</div>
            </div>
          )}
        </div>
      </div>

      <div className="h-28 my-6 bg-black/40 rounded-2xl border border-white/5 p-4 font-mono text-[9px] overflow-y-auto no-scrollbar">
        <div className="text-sky-900 mb-2 font-bold uppercase tracking-widest">Console:</div>
        {logs.map((l, i) => (
          <div key={i} className="mb-1 text-slate-500">
            <span className="opacity-30 mr-2">></span>{l}
          </div>
        ))}
        <div ref={logEndRef} />
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6 pb-2">
        {['Воздух', 'Вода', 'Огонь', 'Земля', 'Эфир', 'Плетение'].map(el => (
          <button 
            key={el}
            onClick={() => { setElement(el as any); addLog(`Focus: ${el}`); }}
            className={`px-4 py-3 rounded-xl text-[9px] font-bold uppercase transition-all border whitespace-nowrap active:scale-95 ${
              element === el ? 'bg-sky-500 border-sky-500 text-black shadow-lg shadow-sky-500/20' : 'bg-white/5 border-white/10 text-slate-500'
            }`}
          >
            {el}
          </button>
        ))}
      </div>

      <button 
        onClick={handleAction}
        disabled={loading}
        className="w-full py-5 bg-white text-black rounded-2xl uppercase text-[11px] font-black tracking-widest active:scale-95 transition-all shadow-2xl"
      >
        {loading ? 'Processing...' : 'Materialize'}
      </button>

      <div className="mt-4 text-center">
        <span className="text-[7px] text-slate-700 uppercase tracking-widest font-bold">Encrypted Artifact Link</span>
      </div>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
