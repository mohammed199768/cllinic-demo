import { CHAT_INTENTS, GUIDE_QUESTIONS } from "@/data/chatbot/intents";
import type { ChatIntent, IntentMatch } from "@/types/chatbot";
import type { Lang } from "@/lib/i18n";
import { normalizeText, textTokens } from "./normalize";

function scoreIntent(query: string, intent: ChatIntent, lang: Lang, pathname: string): number {
  const q = normalizeText(query); if (!q) return 0;
  const aliases = intent.aliases[lang].map(normalizeText);
  if (aliases.includes(q)) return 1;
  let score = 0;
  for (const alias of aliases) {
    if (alias.startsWith(q) || q.startsWith(alias)) score = Math.max(score, 0.84);
    const qTokens = textTokens(q), aTokens = textTokens(alias);
    const overlap = [...qTokens].filter((token) => aTokens.has(token)).length;
    if (overlap) score = Math.max(score, 0.48 + 0.36 * (overlap / Math.max(qTokens.size, aTokens.size)));
  }
  const keys = intent.keywords?.[lang].map(normalizeText) ?? [];
  const qTokens = textTokens(q); const keyOverlap = keys.filter((key) => qTokens.has(key) || q.includes(key)).length;
  if (keyOverlap) score = Math.max(score, 0.5 + Math.min(0.25, keyOverlap * 0.12));
  if (intent.context?.some((route) => pathname.startsWith(route))) score += 0.05;
  return Math.min(score, 1);
}

export function matchIntent(query: string, lang: Lang, pathname = "/"): IntentMatch {
  const ranked = CHAT_INTENTS.map((intent) => ({ intent, score: scoreIntent(query, intent, lang, pathname) })).filter((item) => item.score > 0.34).sort((a, b) => b.score - a.score);
  return { intent: ranked[0]?.intent ?? null, confidence: ranked[0]?.score ?? 0, alternatives: ranked.slice(1, 4).map((item) => item.intent) };
}

export function rankQuestions(query: string, lang: Lang, pathname: string) {
  const q = normalizeText(query);
  if (q.length < 2) return [];
  return GUIDE_QUESTIONS.map((entry) => ({ ...entry, score: scoreIntent(q, entry.intent, lang, pathname) })).filter((entry) => entry.score >= 0.38).sort((a, b) => b.score - a.score).slice(0, 6);
}

export function isMedicalQuestion(query: string) {
  const value = normalizeText(query);
  return /(?:الم|وجع|اعراض|دواء|جرعة|علاج|حراره|نزيف|دوخه|symptom|pain|medicine|dose|treatment|bleeding|fever|dizzy)/.test(value);
}

export function isUrgentWording(query: string) {
  const value = normalizeText(query);
  return /(?:طوارئ|عاجل|فورا|لا استطيع التنفس|emergency|urgent|immediately|cant breathe|cannot breathe)/.test(value);
}
