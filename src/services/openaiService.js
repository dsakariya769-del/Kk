import { SYSTEM_PROMPT, buildPrompt } from "./prompt";

function extractError(data, fallback) {
  return data?.error?.message || fallback;
}

export async function fetchOpenAIAnalysis(payload, apiKey, model) {
  if (!apiKey) return { status: "error", content: "", latencyMs: 0, errorMessage: "OpenAI API key is missing." };

  const started = performance.now();

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey.trim()}`
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: buildPrompt(payload) }
        ],
        temperature: 0.3
      })
    });

    const data = await response.json().catch(() => ({}));
    const latencyMs = Math.round(performance.now() - started);

    if (!response.ok) {
      throw new Error(extractError(data, `OpenAI request failed (${response.status}).`));
    }

    const content = data?.choices?.[0]?.message?.content;
    if (!content) throw new Error("OpenAI returned an empty response.");

    return { status: "success", content, latencyMs, errorMessage: "" };
  } catch (error) {
    return {
      status: "error",
      content: "",
      latencyMs: Math.round(performance.now() - started),
      errorMessage: error?.message || "OpenAI request failed."
    };
  }
}