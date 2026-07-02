// VITE_API_URL must be set in Vercel Dashboard (or .env.production for local builds)
const BASE_URL = import.meta.env.VITE_API_URL || 'https://pravaas.onrender.com/api';

// Warn developers when env var is missing
if (!import.meta.env.VITE_API_URL) {
  console.warn(
    '[Pravaas] VITE_API_URL is not set. Using default:',
    BASE_URL,
    '\n  Set VITE_API_URL in Vercel Dashboard → Project Settings → Environment Variables'
  );
}

const DEFAULT_TIMEOUT = 30000;
const MAX_RETRIES = 5;
const RETRY_DELAY = 3000;

export type ConnectionState = 'idle' | 'connecting' | 'connected' | 'retrying' | 'offline' | 'waking';

let connectionState: ConnectionState = 'idle';
let stateListeners: ((state: ConnectionState) => void)[] = [];

export function getConnectionState(): ConnectionState {
  return connectionState;
}

export function onConnectionStateChange(listener: (state: ConnectionState) => void): () => void {
  stateListeners.push(listener);
  return () => {
    stateListeners = stateListeners.filter((l) => l !== listener);
  };
}

function setConnectionState(state: ConnectionState) {
  connectionState = state;
  stateListeners.forEach((l) => l(state));
}

export function getConnectionStateMessage(state: ConnectionState): string {
  switch (state) {
    case 'connecting': return 'Starting secure connection...';
    case 'waking': return 'Waking server...';
    case 'retrying': return 'Retrying...';
    case 'connected': return 'Connected';
    case 'offline': return 'Backend unavailable';
    default: return '';
  }
}

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = DEFAULT_TIMEOUT): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchWithRetry(url: string, options: RequestInit = {}, retries = MAX_RETRIES): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    if (attempt === 1) {
      setConnectionState('waking');
    } else {
      setConnectionState('retrying');
    }

    try {
      const timeoutMs = attempt === 1 ? 60000 : DEFAULT_TIMEOUT;
      const response = await fetchWithTimeout(url, options, timeoutMs);

      if (response.ok) {
        setConnectionState('connected');
        return response;
      }

      if (response.status >= 400 && response.status < 500) {
        setConnectionState('connected');
        return response;
      }

      lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        lastError = new Error('Request timeout');
      } else {
        lastError = err;
      }
    }

    if (attempt < retries) {
      const delay = RETRY_DELAY * Math.pow(2, attempt - 1);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  setConnectionState('offline');
  throw lastError;
}

async function wakeBackend(): Promise<boolean> {
  try {
    setConnectionState('waking');
    const rootUrl = BASE_URL.replace(/\/api\/?$/, '/');
    const response = await fetchWithTimeout(rootUrl, { method: 'GET' }, 60000);
    return response.ok;
  } catch {
    return false;
  }
}

export async function checkBackendHealth(): Promise<boolean> {
  const healthUrl = BASE_URL.replace(/\/api\/?$/, '/health');
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      if (attempt === 1) {
        setConnectionState('waking');
      } else {
        setConnectionState('retrying');
      }
      const response = await fetchWithTimeout(healthUrl, { method: 'GET' }, 30000);
      if (response.ok) {
        setConnectionState('connected');
        return true;
      }
      if (attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, 5000 * attempt));
      }
    } catch {
      if (attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, 5000 * attempt));
      }
    }
  }
  setConnectionState('offline');
  return false;
}

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetchWithRetry(`${BASE_URL}${path}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  return response.json();
}

export async function apiPost<T>(path: string, body: any): Promise<T> {
  const response = await fetchWithRetry(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  return response.json();
}
