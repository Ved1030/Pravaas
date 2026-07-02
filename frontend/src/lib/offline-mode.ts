const CACHE_PREFIX = 'fc_cache_';
const SYNC_QUEUE_KEY = 'fc_sync_queue';

const MAX_AGES: Record<string, number> = {
  recent_journeys: 24 * 60 * 60 * 1000,
  maps: 7 * 24 * 60 * 60 * 1000,
  history: 48 * 60 * 60 * 1000,
  notifications: 60 * 60 * 1000,
  planner: 2 * 60 * 60 * 1000,
};

interface CacheEntry {
  data: any;
  timestamp: number;
}

interface SyncItem {
  key: string;
  url: string;
  body?: any;
}

export function cacheData(key: string, data: any): void {
  try {
    const entry: CacheEntry = { data, timestamp: Date.now() };
    localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(entry));
  } catch (e) {
    console.error('Failed to cache data:', e);
  }
}

export function getCachedData(key: string, maxAge?: number): any | null {
  try {
    const raw = localStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (!raw) return null;

    const entry: CacheEntry = JSON.parse(raw);
    const age = maxAge ?? MAX_AGES[key] ?? 60 * 60 * 1000;

    if (Date.now() - entry.timestamp > age) {
      localStorage.removeItem(`${CACHE_PREFIX}${key}`);
      return null;
    }

    return entry.data;
  } catch {
    return null;
  }
}

export function clearCache(): void {
  try {
    const keys = Object.keys(localStorage).filter((k) => k.startsWith(CACHE_PREFIX));
    keys.forEach((k) => localStorage.removeItem(k));
  } catch (e) {
    console.error('Failed to clear cache:', e);
  }
}

export function isOnline(): boolean {
  return navigator.onLine;
}

export function onOnline(callback: () => void): () => void {
  window.addEventListener('online', callback);
  return () => window.removeEventListener('online', callback);
}

export function onOffline(callback: () => void): () => void {
  window.addEventListener('offline', callback);
  return () => window.removeEventListener('offline', callback);
}

export function getSyncQueue(): SyncItem[] {
  try {
    const raw = localStorage.getItem(SYNC_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function clearSyncQueue(): void {
  try {
    localStorage.removeItem(SYNC_QUEUE_KEY);
  } catch (e) {
    console.error('Failed to clear sync queue:', e);
  }
}

export async function syncWhenOnline(items: { key: string; url: string; body?: any }[]): Promise<void> {
  try {
    const existing = getSyncQueue();
    const updated = [...existing, ...items];
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to queue sync items:', e);
  }

  if (!navigator.onLine) return;

  const queue = getSyncQueue();
  if (queue.length === 0) return;

  const remaining: SyncItem[] = [];

  for (const item of queue) {
    try {
      const options: RequestInit = { method: 'POST', headers: { 'Content-Type': 'application/json' } };
      if (item.body !== undefined) {
        options.body = JSON.stringify(item.body);
      }
      const response = await fetch(item.url, options);
      if (!response.ok) {
        remaining.push(item);
      }
    } catch {
      remaining.push(item);
    }
  }

  if (remaining.length > 0) {
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(remaining));
  } else {
    localStorage.removeItem(SYNC_QUEUE_KEY);
  }
}
