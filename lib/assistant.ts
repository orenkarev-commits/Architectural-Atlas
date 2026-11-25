import Constants from 'expo-constants';

export type ChatMsg = { role: 'user' | 'assistant'; content: string };
export type Citation = { type: 'building' | 'architect'; id: number | null; name: string };
export type AtlasAnswer = { answer: string; citations: Citation[]; mapFocus: number[] };

// The deployed EAS Hosting base URL (set via EXPO_PUBLIC_ASSISTANT_URL → app.config extra).
const BASE = ((Constants.expoConfig?.extra as any)?.assistantUrl as string) || '';

/** Whether the research assistant is configured (an endpoint URL is set). */
export const assistantEnabled = BASE.length > 0;

/** Ask the Atlas assistant. Throws on network/endpoint failure so the UI can fall back. */
export async function askAtlas(messages: ChatMsg[]): Promise<AtlasAnswer> {
  const res = await fetch(`${BASE}/api/ask`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ messages }),
  });
  if (!res.ok) throw new Error(`assistant_${res.status}`);
  const data = (await res.json()) as Partial<AtlasAnswer> & { error?: string };
  if (data.error) throw new Error(data.error);
  return {
    answer: typeof data.answer === 'string' ? data.answer : '',
    citations: Array.isArray(data.citations) ? data.citations : [],
    mapFocus: Array.isArray(data.mapFocus) ? data.mapFocus : [],
  };
}
