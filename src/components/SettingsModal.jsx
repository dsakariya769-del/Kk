import { Eye, EyeOff, X, Download, Trash2, ShieldAlert } from "lucide-react";
import { useState } from "react";

export default function SettingsModal({ settings, onChange, onClose, onExport, onWipe }) {
  const [showOpenAI, setShowOpenAI] = useState(false);
  const [showGemini, setShowGemini] = useState(false);

  return (
    <div className="overlay" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div><span className="eyebrow">CONFIGURATION</span><h2>Settings</h2></div>
          <button className="icon-btn" onClick={onClose}><X size={19}/></button>
        </div>

        <div className="warning">
          <ShieldAlert size={18}/>
          <div><strong>Private BYOK mode</strong><p>Keys stay in this browser's localStorage. This app has no backend. Don't use a shared/public browser profile for personal API keys.</p></div>
        </div>

        <label>OpenAI API key
          <div className="key-input"><input type={showOpenAI ? "text" : "password"} value={settings.openaiApiKey} onChange={e => onChange({openaiApiKey: e.target.value})} placeholder="sk-…" /><button onClick={() => setShowOpenAI(v => !v)}>{showOpenAI ? <EyeOff size={16}/> : <Eye size={16}/>}</button></div>
        </label>

        <label>Gemini API key
          <div className="key-input"><input type={showGemini ? "text" : "password"} value={settings.geminiApiKey} onChange={e => onChange({geminiApiKey: e.target.value})} placeholder="AIza…" /><button onClick={() => setShowGemini(v => !v)}>{showGemini ? <EyeOff size={16}/> : <Eye size={16}/>}</button></div>
        </label>

        <div className="two-col">
          <label>OpenAI model
            <input value={settings.openaiModel} onChange={e => onChange({openaiModel: e.target.value})} placeholder="gpt-4o-mini" />
          </label>
          <label>Gemini model
            <input value={settings.geminiModel} onChange={e => onChange({geminiModel: e.target.value})} placeholder="gemini-2.5-flash" />
          </label>
        </div>

        <div className="danger-zone">
          <div><strong>Local data</strong><p>Export a backup or wipe everything stored by MindSync in this browser.</p></div>
          <div className="danger-actions">
            <button className="btn secondary" onClick={onExport}><Download size={15}/> Export JSON</button>
            <button className="btn danger" onClick={onWipe}><Trash2 size={15}/> Wipe data</button>
          </div>
        </div>

        <div className="modal-foot"><button className="btn primary" onClick={onClose}>Save & Close</button></div>
      </div>
    </div>
  );
}