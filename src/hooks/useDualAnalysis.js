import { fetchOpenAIAnalysis } from "../services/openaiService";
import { fetchGeminiAnalysis } from "../services/geminiService";

export async function runDualAnalysis(payload, settings, targets = ["chatgpt", "gemini"]) {
  const jobs = [];

  if (targets.includes("chatgpt")) {
    jobs.push(
      fetchOpenAIAnalysis(payload, settings.openaiApiKey, settings.openaiModel)
        .then((result) => ["chatgpt", result])
    );
  }

  if (targets.includes("gemini")) {
    jobs.push(
      fetchGeminiAnalysis(payload, settings.geminiApiKey, settings.geminiModel)
        .then((result) => ["gemini", result])
    );
  }

  const settled = await Promise.allSettled(jobs);
  const result = {};

  for (const item of settled) {
    if (item.status === "fulfilled") {
      const [key, value] = item.value;
      result[key] = value;
    }
  }

  return result;
}