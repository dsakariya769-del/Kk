import { Copy, RefreshCw, AlertCircle, CheckCircle2, Clock3 } from "lucide-react";
import Markdown from "./Markdown";

export default function ModelResultCard({ provider, result, onRetry, followUp, setFollowUp, onFollowUp }) {
  const isOpenAI = provider === "chatgpt";
  const label = isOpenAI ? "ChatGPT" : "Gemini";

  async function copy() {
    if (result.content) await navigator.clipboard?.writeText(result.content);
  }

  return (
    <section className="result-card">
      <div className="result-head">
        <div className="provider">
          <div className={`provider-icon ${isOpenAI ? "openai" : "gemini"}`}>{isOpenAI ? "O" : "G"}</div>
          <div>
            <strong>{label}</strong>
            <span>{isOpenAI ? "OpenAI" : "Google AI"}</span>
          </div>
        </div>
        <div className="result-meta">
          {result.status === "success" && <span className="status success"><CheckCircle2 size={14}/> Ready</span>}
          {result.status === "loading" && <span className="status loading"><span className="dot-pulse"/> Thinking</span>}
          {result.status === "error" && <span className="status error"><AlertCircle size={14}/> Error</span>}
          {result.latencyMs > 0 && <span className="latency"><Clock3 size={13}/>{result.latencyMs}ms</span>}
        </div>
      </div>

      <div className="result-body">
        {result.status === "loading" ? (
          <div className="skeleton">
            <i/><i/><i/><i/><i/>
          </div>
        ) : result.status === "error" ? (
          <div className="error-box">
            <strong>Request failed</strong>
            <p>{result.errorMessage}</p>
            <button className="btn secondary" onClick={onRetry}><RefreshCw size={15}/> Retry</button>
          </div>
        ) : result.content ? (
          <Markdown>{result.content}</Markdown>
        ) : (
          <div className="empty-result">Run an analysis to see this model's independent view.</div>
        )}
      </div>

      <div className="result-actions">
        <button className="icon-btn" onClick={copy} disabled={!result.content} title="Copy response"><Copy size={16}/></button>
        <div className="follow-up">
          <input
            value={followUp}
            onChange={(e) => setFollowUp(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onFollowUp(); } }}
            placeholder={`Ask ${label} a follow-up…`}
          />
          <button className="btn secondary compact" onClick={onFollowUp} disabled={!followUp.trim()}>Ask</button>
        </div>
      </div>
    </section>
  );
}