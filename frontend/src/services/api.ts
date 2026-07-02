const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const DEFAULT_TIMEOUT = 15000;
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

type ConnectionState = 'idle' | 'connecting' | 'connected' | 'retrying' | 'offline';

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
      setConnectionState('connecting');
    } else {
      setConnectionState('retrying');
    }

    try {
      const response = await fetchWithTimeout(url, options);

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
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY * attempt));
    }
  }

  setConnectionState('offline');
  throw lastError;
}

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const healthUrl = BASE_URL.replace(/\/api\/?$/, '/health');
    const response = await fetchWithTimeout(healthUrl, { method: 'GET' }, 8000);
    return response.ok;
  } catch {
    return false;
  }
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
