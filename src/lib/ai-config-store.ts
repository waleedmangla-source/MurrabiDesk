"use client";

export interface AIConfig {
  systemPrompt: string;
  temperature: number;
  userName: string;
  model: "gemini-1.5-pro" | "gemini-1.5-flash";
}

const DEFAULT_CONFIG: AIConfig = {
  systemPrompt: "You are Murrabi AI, a specialized companion for Islamic scholars and community administrators. You are humble, precise, and helpful, focused on administrative efficiency and spiritual scholarship.",
  temperature: 0.7,
  userName: "Murrabi",
  model: "gemini-1.5-flash",
};

export const getAIConfig = (): AIConfig => {
  if (typeof window === "undefined") return DEFAULT_CONFIG;
  const saved = localStorage.getItem("murabbi_ai_config");
  if (!saved) return DEFAULT_CONFIG;
  try {
    return JSON.parse(saved);
  } catch {
    return DEFAULT_CONFIG;
  }
};

export const saveAIConfig = (config: AIConfig) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("murabbi_ai_config", JSON.stringify(config));
};
