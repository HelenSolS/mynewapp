import { GoogleGenAI } from "@google/genai";

// Работаем через глобальный объект aistudio, который предоставляет среда
const as = (window as any).aistudio;

export const checkAuth = async (): Promise<boolean> => {
  if (!as) return false;
  try {
    return await as.hasSelectedApiKey();
  } catch {
    return false;
  }
};

export const openKeyDialog = async (): Promise<boolean> => {
  if (!as) {
    alert("Ключ API должен быть предоставлен средой исполнения.");
    return false;
  }
  try {
    await as.openSelectKey();
    return true; 
  } catch (e) {
    console.error("Ошибка при выборе ключа:", e);
    return false;
  }
};

export const getGeminiClient = () => {
  // Ключ берется автоматически из process.env.API_KEY после выбора в диалоге
  return new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
};

export const isAuthError = (err: any) => {
  const msg = err?.message || "";
  return msg.includes("Requested entity was not found") || msg.includes("API key not valid") || msg.includes("403");
};