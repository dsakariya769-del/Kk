import { Search, X, Trash2, FileText } from "lucide-react";
import { useMemo, useState } from "react";

export default function HistoryDrawer({ open, sessions, onClose, onLoad, onDelete }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sessions;
    return sessions.filter(s => [s.title, s.topic, s.personalNotes].join(" ").toLowerCase().includes(q));
  }, [sessions, query]);

  if (!open) return null;

  return (
    <div className="overlay" onMouseDown={onClose}>
      <aside className="drawer" onMouseDown={(e) => e.stopPropagation()}>
        <div className="drawer-head">
          <div><span className="eyebrow">ARCHIVE</span><h2>History</h2></div>
          <button className="icon-btn" onClick={onClose}><X size={19}/></button>
        </div>
        <div className="search">
          <Search size={16}/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search explorations…" />
        </div>
        <div className="history-list">
          {filtered.length === 0 ? (
            <div className="empty-history"><FileText size={26}/><p>No saved explorations yet.</p></div>
          ) : filtered.map(s => (
            <div className="history-card" key={s.id}>
              <button className="history-main" onClick={() => { onLoad(s); onClose(); }}>
                <strong>{s.title || "Untitled exploration"}</strong>
                <span>{s.topic || "No topic"}</span>
                <small>{new Date(s.timestamp).toLocaleString()}</small>
              </button>
              <button className="icon-btn danger-icon" onClick={() => onDelete(s.id)} title="Delete"><Trash2 size={15}/></button>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}