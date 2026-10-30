import OpenAI from "openai";

const MODEL = "grok-4.7";
const SLOW = "Grok took too long. Your brief is still here — try once more.";
const UNFINISHED = "Grok could not finish that. Your work is still here — try once more.";
const MISSING_KEY = "This deployment has no XAI_API_KEY set, so Daybook cannot call Grok yet.";

export type ModelResult = { ok: true; value: unknown } | { ok: false; status: number; message: string };

function fail(status: number, message: string): ModelResult {
  return { ok: false, status, message };
}

function stripQuotes(value: string): string {
  if (
    (value.startsWith('"') && value.endsWith('"') && value.length >= 2) ||
    (value.startsWith("'") && value.endsWith("'") && value.length >= 2)
  ) {
    return value.slice(1, -1).trim();
  }
  return value;
}

/** Accept a console paste that includes quotes, a Bearer prefix, or the variable name. */
export function normalizeApiKey(raw: string | undefined): string {
  if (!raw) return "";
  let key = raw.replace(/^\uFEFF/, "").trim();
  key = stripQuotes(key);
  const assigned = key.match(/^XAI_API_KEY\s*=\s*(.*)$/);
  if (assigned) key = stripQuotes(assigned[1].trim());
  if (/^bearer\s+/i.test(key)) key = stripQuotes(key.replace(/^bearer\s+/i, "").trim());
  return key.replace(/[\u200B-\u200D\uFEFF]/g, "").trim();
}

/** Kind and length only. Never the secret. */
export function describeKey(key: string): string {
  if (!key) return "an empty value";
  if (key.startsWith("xai-")) return `a console key, ${key.length} characters`;
  if (key.startsWith("eyJ")) return `a session token, ${key.length} characters`;
  if (key.startsWith("sk-")) return `an OpenAI-style key, ${key.length} characters`;
  return `an unrecognized value, ${key.length} characters`;
}

export function rejectedKeyMessage(shape: string): string {
  return `xAI rejected the API key. The server is sending ${shape}. Use the full key from the xAI console. It starts with xai-. Save that value alone as XAI_API_KEY, then redeploy.`;
}

function statusOf(error: unknown): number | undefined {
  if (typeof error !== "object" || error === null || !("status" in error)) return undefined;
  return typeof error.status === "number" ? error.status : undefined;
}

function isRejectedKey(error: unknown): boolean {
  if (statusOf(error) === 401) return true;
  const message = error instanceof Error ? error.message.toLowerCase() : "";
  return message.includes("incorrect api key") || (message.includes("invalid") && message.includes("api key"));
}

function isTimeout(error: unknown): boolean {
  const message = error instanceof Error ? error.message.toLowerCase() : "";
  return message.includes("timed out") || message.includes("timeout");
}

export async function completeJson(
  schemaName: string,
  schema: object,
  instructions: string,
  prompt: string,
): Promise<ModelResult> {
  const apiKey = normalizeApiKey(process.env.XAI_API_KEY);
  if (!apiKey) return fail(500, MISSING_KEY);

  const client = new OpenAI({
    apiKey,
    baseURL: "https://api.x.ai/v1",
    timeout: 55_000,
  });

  try {
    const response = await client.responses.create({
      model: MODEL,
      store: false,
      reasoning: { effort: "low" },
      max_output_tokens: 8000,
      input: [
        { role: "system", content: instructions },
        { role: "user", content: prompt },
      ],
      text: {
        format: {
          type: "json_schema",
          name: schemaName,
          strict: true,
          schema: schema as Record<string, unknown>,
        },
      },
    });
    if (response.status === "incomplete") return fail(504, SLOW);
    const text = response.output_text?.trim();
    if (!text) return fail(502, UNFINISHED);
    return { ok: true, value: JSON.parse(text) as unknown };
  } catch (error) {
    if (isRejectedKey(error)) {
      console.error("key rejected", describeKey(apiKey));
      return fail(502, rejectedKeyMessage(describeKey(apiKey)));
    }
    if (isTimeout(error)) return fail(504, SLOW);
    console.error("model call failed", error instanceof Error ? error.name : "unknown");
    return fail(502, UNFINISHED);
  }
}
