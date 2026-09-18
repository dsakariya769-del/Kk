import { SYSTEM_PROMPT, buildPrompt } from "./prompt";

export async function fetchGeminiAnalysis(payload, apiKey, model) {
  if (!apiKey) return { status: "error", content: "", latencyMs: 0, errorMessage: "Gemini API key is missing." };

  const started = performance.now();

  try {
    const cleanModel = model.trim().replace(/^models\//, "");
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(cleanModel)}:generateContent`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey.trim()
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: SYSTEM_PROMPT }]
        },
        contents: [
          {
            role: "user",
            parts: [{ text: buildPrompt(payload) }]
          }
        ]
      })
    });

    const data = await response.json().catch(() => ({}));
    const latencyMs = Math.round(performance.now() - started);

    if (!response.ok) {
      const message = data?.error?.message || `Gemini request failed (${response.status}).`;
      throw new Error(message);
    }

    const content = data?.candidates?.[0]?.content?.parts
      ?.map((part) => part?.text || "")
      .join("")
      .trim();

    if (!content) {
      const blocked = data?.promptFeedback?.blockReason;
      throw new Error(blocked ? `Gemini blocked the request: ${blocked}.` : "Gemini returned an empty response.");
    }

    return { status: "success", content, latencyMs, errorMessage: "" };
  } catch (error) {
    return {
      status: "error",
      content: "",
      latencyMs: Math.round(performance.now() - started),
      errorMessage: error?.message || "Gemini request failed."
    };
  }
}