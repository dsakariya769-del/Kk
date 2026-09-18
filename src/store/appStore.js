const STATE_KEY = "mind_sync_state_v1";
const ACTIVE_KEY = "mind_sync_active_v1";

export const DEFAULT_STATE = {
  settings: {
    openaiApiKey: "",
    geminiApiKey: "",
    openaiModel: "gpt-4o-mini",
    geminiModel: "gemini-2.5-flash",
    theme: "dark"
  },
  sessions: []
};

function safeParse(value, fallback) {
  try { return value ? JSON.parse(value) : fallback; }
  catch { return fallback; }
}

export function loadState() {
  const stored = safeParse(localStorage.getItem(STATE_KEY), DEFAULT_STATE);
  return {
    ...DEFAULT_STATE,
    ...stored,
    settings: { ...DEFAULT_STATE.settings, ...(stored.settings || {}) },
    sessions: Array.isArray(stored.sessions) ? stored.sessions : []
  };
}

export function saveState(state) {
  localStorage.setItem(STATE_KEY, JSON.stringify(state));
}

export function loadActiveSession() {
  return safeParse(localStorage.getItem(ACTIVE_KEY), null);
}

export function saveActiveSession(session) {
  if (session) localStorage.setItem(ACTIVE_KEY, JSON.stringify(session));
  else localStorage.removeItem(ACTIVE_KEY);
}

export function createSession() {
  return {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    title: "Untitled exploration",
    topic: "",
    context: "",
    parameters: "",
    chatgpt: { status: "idle", content: "", latencyMs: 0, errorMessage: "" },
    gemini: { status: "idle", content: "", latencyMs: 0, errorMessage: "" },
    followUps: [],
    personalNotes: "",
    isLocked: false
  };
}