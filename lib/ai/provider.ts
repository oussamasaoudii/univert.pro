import { groq } from "@ai-sdk/groq";

export const AI_PROVIDER_ENV_KEYS = [
  "AI_GATEWAY_API_KEY",
  "OPENAI_API_KEY",
  "ANTHROPIC_API_KEY",
  "GOOGLE_GENERATIVE_AI_API_KEY",
  "GROQ_API_KEY",
  "XAI_API_KEY",
  "OPENROUTER_API_KEY",
  "TOGETHER_API_KEY",
] as const;

const GROQ_TEXT_MODEL = "llama-3.3-70b-versatile";
const DEFAULT_GATEWAY_MODEL = "openai/gpt-5-mini";

function hasValue(value: string | undefined) {
  return typeof value === "string" && value.trim().length > 0;
}

export function hasConfiguredAiProvider() {
  return AI_PROVIDER_ENV_KEYS.some((key) => hasValue(process.env[key]));
}

export function getDefaultTextModel() {
  if (hasValue(process.env.GROQ_API_KEY)) {
    return groq(GROQ_TEXT_MODEL);
  }

  return DEFAULT_GATEWAY_MODEL;
}

export function getActiveAiProviderLabel() {
  if (hasValue(process.env.GROQ_API_KEY)) {
    return "groq";
  }

  if (hasConfiguredAiProvider()) {
    return "gateway";
  }

  return "fallback";
}
