import type { Lang } from "@/lib/i18n";

export type BilingualText = { ar: string; en: string };
export type ChatAction = { label: BilingualText; href?: string; kind?: "route" | "external" | "install" | "language"; value?: Lang };
export type ChatIntent = {
  id: string;
  category: "navigation" | "booking" | "services" | "companion" | "content" | "family" | "pwa" | "contact";
  aliases: { ar: string[]; en: string[] };
  keywords?: { ar: string[]; en: string[] };
  response: BilingualText;
  actions?: ChatAction[];
  followUps?: BilingualText[];
  context?: string[];
};
export type ChatMessage = { id: string; from: "guide" | "user"; text: string; actions?: ChatAction[]; followUps?: BilingualText[] };
export type IntentMatch = { intent: ChatIntent | null; confidence: number; alternatives: ChatIntent[] };
