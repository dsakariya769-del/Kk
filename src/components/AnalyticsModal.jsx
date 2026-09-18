import { X, Activity, CheckCircle2, Timer, CalendarDays } from "lucide-react";
import { useMemo } from "react";

export default function AnalyticsModal({ sessions, onClose }) {
  const stats = useMemo(() => {
    const successful = sessions.flatMap(s => [s.chatgpt, s.gemini]).filter(r => r?.status === "success" && r.latencyMs > 0);
    const openai = successful.filter((_, i) => false);
    const allLatency = successful.map(r => r.latencyMs);
    const locked = sessions.filter(s => s.isLocked).length;
    const days = new Set(sessions.map(s => new Date(s.timestamp).toISOString().slice(0, 10))).size;
    return {
      total: sessions.length,
      locked,
      avg: allLatency.length ? Math.round(allLatency.reduce((a,b) => a+b, 0) / allLatency.length) : 0,
      days,
      openaiAvg: (() => {
        const a = sessions.map(s=>s.chatgpt).filter(r=>r?.status==="success" && r.latencyMs>0).map(r=>r.latencyMs);
        return a.length ? Math.round(a.reduce((x,y)=>x+y,0)/a.length) : 0;
      })(),
      geminiAvg: (() => {
        const a = sessions.map(s=>s.gemini).filter(r=>r?.status==="success" && r.latencyMs>0).map(r=>r.latencyMs);
        return a.length ? Math.round(a.reduce((x,y)=>x+y,0)/a.length) : 0;
      })()
    };
  }, [sessions]);

  return (
    <div className="overlay" onMouseDown={onClose}>
      <div className="modal analytics" onMouseDown={e => e.stopPropagation()}>
        <div className="modal-head"><div><span className="eyebrow">LOCAL METRICS</span><h2>Analytics</h2></div><button className="icon-btn" onClick={onClose}><X size={19}/></button></div>
        <div className="metrics">
          <Metric icon={<Activity/>} label="Explorations" value={stats.total}/>
          <Metric icon={<CheckCircle2/>} label="Decisions locked" value={stats.locked}/>
          <Metric icon={<Timer/>} label="Average latency" value={stats.avg ? `${stats.avg}ms` : "—"}/>
          <Metric icon={<CalendarDays/>} label="Active thinking days" value={stats.days}/>
        </div>
        <div className="latency-panel">
          <div><span>ChatGPT average</span><strong>{stats.openaiAvg ? `${stats.openaiAvg}ms` : "—"}</strong></div>
          <div><span>Gemini average</span><strong>{stats.geminiAvg ? `${stats.geminiAvg}ms` : "—"}</strong></div>
        </div>
        <p className="muted">These are app-level measurements from completed browser sessions, not provider billing or account usage statistics.</p>
      </div>
    </div>
  );
}

function Metric({icon,label,value}) {
  return <div className="metric"><div className="metric-icon">{icon}</div><span>{label}</span><strong>{value}</strong></div>;
}