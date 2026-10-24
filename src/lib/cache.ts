// Small in-memory LRU for answers to first-turn questions. Saves model quota on
// repeated starter prompts; resets on deploy, which is when content changes.

type Entry = { text: string; provider: string; at: number };

const TTL_MS = 6 * 60 * 60 * 1000;
const MAX_ENTRIES = 300;

const key = (message: string) => message.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

const store = new Map<string, Entry>();

export const answerCache = {
  get(message: string, now = Date.now()): Entry | undefined {
    const k = key(message);
    const hit = store.get(k);
    if (!hit) return undefined;
    if (now - hit.at > TTL_MS) {
      store.delete(k);
      return undefined;
    }
    store.delete(k); // refresh recency
    store.set(k, hit);
    return hit;
  },
  set(message: string, entry: { text: string; provider: string }, now = Date.now()) {
    if (!entry.text.trim()) return;
    store.set(key(message), { ...entry, at: now });
    while (store.size > MAX_ENTRIES) store.delete(store.keys().next().value!);
  },
};
