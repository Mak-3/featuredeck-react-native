import { AppState, AppStateStatus } from 'react-native';
import { post } from './client';

export interface TrackedEvent {
  event: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

const FLUSH_THRESHOLD = 10;
const FLUSH_INTERVAL_MS = 30_000;

let queue: TrackedEvent[] = [];
let flushTimer: ReturnType<typeof setInterval> | null = null;
let appStateSubscription: ReturnType<typeof AppState.addEventListener> | null = null;
let running = false;

function handleAppStateChange(nextState: AppStateStatus) {
  if (nextState === 'background' || nextState === 'inactive') {
    flush();
  }
}

export function trackEvent(event: string, metadata?: Record<string, any>) {
  queue.push({ event, timestamp: Date.now(), metadata });

  if (queue.length >= FLUSH_THRESHOLD) {
    flush();
  }
}

export async function flush(): Promise<void> {
  if (queue.length === 0) return;

  const batch = [...queue];
  queue = [];

  try {
    await post('/events', { events: batch });
  } catch {
    queue = [...batch, ...queue];
  }
}

export function startEventTracker() {
  if (running) return;
  running = true;

  flushTimer = setInterval(flush, FLUSH_INTERVAL_MS);

  appStateSubscription = AppState.addEventListener('change', handleAppStateChange);
}

export function stopEventTracker() {
  if (!running) return;
  running = false;

  flush();

  if (flushTimer) {
    clearInterval(flushTimer);
    flushTimer = null;
  }

  if (appStateSubscription) {
    appStateSubscription.remove();
    appStateSubscription = null;
  }
}

export function getQueueSize(): number {
  return queue.length;
}
