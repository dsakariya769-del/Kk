import { useEffect, useMemo, useRef, useState } from "react";
import { BrainCircuit, History, Settings, BarChart3, Plus, Save, Lock, Download, Trash2, Sparkles, Send, RotateCcw } from "lucide-react";
import ModelResultCard from "./components/ModelResultCard";
import HistoryDrawer from "./components/HistoryDrawer";
import SettingsModal from "./components/SettingsModal";
import AnalyticsModal from "./components/AnalyticsModal";
import Toast from "./components/Toast";
import { createSession, loadActiveSession, loadState, saveActiveSession, saveState } from "./store/appStore";
import { runDualAnalysis } from "./hooks/useDualAnalysis";

export default function App() {
  const [state, setState] = useState(() => loadState());
  const [session, setSession] = useState(() => loadActiveSession() || createSession());
  const [historyOpen, setHistoryOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [followUps, setFollowUps] = useState({ chatgpt: "", gemini: "" });
  const [activeMobileTab, setActiveMobileTab] = useState("both");
  const contextRef = useRef(null);

  useEffect(() => {
    saveState(state);
  }, [state]);

  useEffect(() => {
    saveActiveSession(session);
  }, [session]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4200);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleRun();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const updateSession = (patch) => setSession(s => ({ ...s, ...patch }));
  const updateResult = (key, patch) => setSession(s => ({ ...s, [key]: { ...s[key], ...patch } }));

  function newSession() {
    setSession(createSession());
    setFollowUps({ chatgpt: "", gemini: "" });
  }

  async function handleRun(targets = ["chatgpt", "gemini"], followUp = "") {
    if (!session.topic.trim()) {
      setToast({ type: "error", message: "Add a core topic or dilemma first." });
      return;
    }

    const needsOpenAI = targets.includes("chatgpt") && !state.settings.openaiApiKey;
    const needsGemini = targets.includes("gemini") && !state.settings.geminiApiKey;
    if (needsOpenAI || needsGemini) {
      setToast({ type: "error", message: "Add the required API key(s) in Settings before running." });
      setSettingsOpen(true);
      return;
    }

    for (const key of targets) updateResult(key, { status: "loading", errorMessage: "", content: "" });

    const result = await runDualAnalysis(
      { topic: session.topic, context: session.context, parameters: session.parameters, followUp },
      state.settings,
      targets
    );

    for (const key of targets) {
      if (result[key]) updateResult(key, result[key]);
    }

    if (followUp) {
      setSession(s => ({
        ...s,
        followUps: [
          ...s.followUps,
          {
            target: targets.length === 2 ? "both" : targets[0],
            query: followUp,
            chatgptResponse: result.chatgpt?.content || "",
            geminiResponse: result.gemini?.content || ""
          }
        ]
      }));
    }

    if (Object.values(result).some(r => r.status === "success")) {
      setToast({ type: "success", message: followUp ? "Follow-up completed." : "Dual analysis completed." });
    } else {
      setToast({ type: "error", message: "Both requested analyses failed. Check the error cards and your Settings." });
    }
  }

  function submitFollowUp(target) {
    const q = followUps[target].trim();
    if (!q) return;
    setFollowUps(v => ({ ...v, [target]: "" }));
    handleRun([target], q);
  }

  function saveSession() {
    const exists = state.sessions.some(s => s.id === session.id);
    const sessions = exists
      ? state.sessions.map(s => s.id === session.id ? session : s)
      : [session, ...state.sessions];
    setState(s => ({ ...s, sessions }));
    setToast({ type: "success", message: "Session saved locally." });
  }

  function lockDecision() {
    const locked = { ...session, isLocked: true };
    setSession(locked);
    const exists = state.sessions.some(s => s.id === locked.id);
    setState(s => ({ ...s, sessions: exists ? s.sessions.map(x => x.id === locked.id ? locked : x) : [locked, ...s.sessions] }));
    setToast({ type: "success", message: "Decision locked and saved locally." });
  }

  function loadSession(s) {
    setSession(s);
    setFollowUps({ chatgpt: "", gemini: "" });
  }

  function deleteSession(id) {
    setState(s => ({ ...s, sessions: s.sessions.filter(x => x.id !== id) }));
    if (session.id === id) newSession();
  }

  function exportData() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mind-sync-backup-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function wipeData() {
    if (!window.confirm("Wipe all MindSync settings and sessions from this browser?")) return;
    localStorage.removeItem("mind_sync_state_v1");
    localStorage.removeItem("mind_sync_active_v1");
    setState(loadState());
    setSession(createSession());
    setToast({ type: "success", message: "Local MindSync data wiped." });
    setSettingsOpen(false);
  }

  const keyStatus = useMemo(() => ({
    chatgpt: Boolean(state.settings.openaiApiKey),
    gemini: Boolean(state.settings.geminiApiKey)
  }), [state.settings]);

  const visible = {
    chatgpt: activeMobileTab === "both" || activeMobileTab === "chatgpt",
    gemini: activeMobileTab === "both" || activeMobileTab === "gemini"
  };

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark"><BrainCircuit size={21}/></div>
          <div><strong>MindSync</strong><span>Decision Lab</span></div>
        </div>

        <div className="session-title">
          <input value={session.title} onChange={e => updateSession({ title: e.target.value })} aria-label="Session title" placeholder="Untitled exploration" />
          <span className="save-dot" title="Auto-saved locally"/>
        </div>

        <nav>
          <button className="nav-btn" onClick={() => setAnalyticsOpen(true)}><BarChart3 size={16}/> <span>Analytics</span></button>
          <button className="nav-btn" onClick={() => setHistoryOpen(true)}><History size={16}/> <span>History</span></button>
          <button className="nav-btn" onClick={() => setSettingsOpen(true)}><Settings size={16}/> <span>Settings</span></button>
          <button className="btn primary" onClick={newSession}><Plus size={16}/> New</button>
        </nav>
      </header>

      <main>
        <section className="hero">
          <div>
            <span className="eyebrow">PRIVATE AI THOUGHT WORKSPACE</span>
            <h1>Think it through.<br/><em>See the angles.</em></h1>
            <p>Dump the messy context. Get two independent analyses. Keep the final decision yours.</p>
          </div>
          <div className="key-status">
            <KeyStatus label="ChatGPT" ok={keyStatus.chatgpt}/>
            <KeyStatus label="Gemini" ok={keyStatus.gemini}/>
          </div>
        </section>

        <section className="input-panel">
          <div className="field-row">
            <label className="field wide"><span>CORE DILEMMA / QUESTION</span><input value={session.topic} onChange={e => updateSession({ topic: e.target.value })} placeholder="What are you trying to figure out?" /></label>
          </div>
          <div className="field-grid">
            <label className="field"><span>BRAIN DUMP & CONTEXT</span><textarea ref={contextRef} value={session.context} onChange={e => updateSession({ context: e.target.value })} placeholder="Write everything that's on your mind. Facts, worries, constraints, ideas — messy is fine." /></label>
            <label className="field"><span>DECISION PARAMETERS <small>OPTIONAL</small></span><textarea value={session.parameters} onChange={e => updateSession({ parameters: e.target.value })} placeholder="Timeline, priorities, risk tolerance, budget, constraints…" /></label>
          </div>
          <div className="action-row">
            <button className="btn primary big" onClick={() => handleRun()} disabled={session.chatgpt.status === "loading" || session.gemini.status === "loading"}><Sparkles size={17}/> Run Dual Analysis <kbd>Ctrl ↵</kbd></button>
            <span className="hint">Both models receive the same core context.</span>
          </div>
        </section>

        <div className="mobile-tabs">
          <button className={activeMobileTab==="both"?"active":""} onClick={() => setActiveMobileTab("both")}>Both</button>
          <button className={activeMobileTab==="chatgpt"?"active":""} onClick={() => setActiveMobileTab("chatgpt")}>ChatGPT</button>
          <button className={activeMobileTab==="gemini"?"active":""} onClick={() => setActiveMobileTab("gemini")}>Gemini</button>
        </div>

        <section className="results-grid">
          {visible.chatgpt && <ModelResultCard
            provider="chatgpt"
            result={session.chatgpt}
            onRetry={() => handleRun(["chatgpt"])}
            followUp={followUps.chatgpt}
            setFollowUp={v => setFollowUps(x => ({ ...x, chatgpt: v }))}
            onFollowUp={() => submitFollowUp("chatgpt")}
          />}
          {visible.gemini && <ModelResultCard
            provider="gemini"
            result={session.gemini}
            onRetry={() => handleRun(["gemini"])}
            followUp={followUps.gemini}
            setFollowUp={v => setFollowUps(x => ({ ...x, gemini: v }))}
            onFollowUp={() => submitFollowUp("gemini")}
          />}
        </section>

        <section className="notes-panel">
          <div className="notes-head">
            <div><span className="eyebrow">YOUR CALL</span><h2>Personal Decision Notes</h2></div>
            {session.isLocked && <span className="locked"><Lock size={14}/> Decision locked</span>}
          </div>
          <textarea value={session.personalNotes} onChange={e => updateSession({ personalNotes: e.target.value })} placeholder="What do you think after seeing both perspectives? Your notes are yours — the AI does not decide for you." />
          <div className="notes-actions">
            <button className="btn secondary" onClick={saveSession}><Save size={15}/> Save Session</button>
            <button className="btn primary" onClick={lockDecision} disabled={!session.personalNotes.trim()}><Lock size={15}/> Lock Decision</button>
            <button className="btn ghost" onClick={() => setSession(s => ({...s, personalNotes:""}))}><RotateCcw size={15}/> Clear Notes</button>
          </div>
        </section>
      </main>

      <footer><span>MindSync V1</span><span>Browser-local • BYOK • No backend</span><span>AI can be wrong — verify important facts.</span></footer>

      <HistoryDrawer open={historyOpen} sessions={state.sessions} onClose={() => setHistoryOpen(false)} onLoad={loadSession} onDelete={deleteSession}/>
      {settingsOpen && <SettingsModal settings={state.settings} onChange={patch => setState(s => ({...s, settings: {...s.settings, ...patch}}))} onClose={() => setSettingsOpen(false)} onExport={exportData} onWipe={wipeData}/>}
      {analyticsOpen && <AnalyticsModal sessions={state.sessions} onClose={() => setAnalyticsOpen(false)}/>}
      <Toast toast={toast} onClose={() => setToast(null)}/>
    </div>
  );
}

function KeyStatus({label, ok}) {
  return <span className="key-pill"><i className={ok ? "ok" : ""}/>{label}</span>;
}