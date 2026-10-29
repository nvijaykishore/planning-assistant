import OpenAI from "openai";

const MODEL = "grok-4.7";

type ShapedError = Error & { shape?: string };

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

function rejectedKey(key: string): ShapedError {
  const error = new Error("rejected_key") as ShapedError;
  error.shape = describeKey(key);
  return error;
}

function isRejectedKey(error: unknown): boolean {
  const message = error instanceof Error ? error.message.toLowerCase() : "";
  const status =
    typeof error === "object" && error && "status" in error ? Number((error as { status: unknown }).status) : 0;
  if (status === 401) return true;
  return message.includes("incorrect api key") || (message.includes("invalid") && message.includes("api key"));
}

export async function completeJson(
  schemaName: string,
  schema: object,
  instructions: string,
  prompt: string,
): Promise<unknown> {
  const apiKey = normalizeApiKey(process.env.XAI_API_KEY);
  if (!apiKey) throw new Error("missing_key");

  const client = new OpenAI({
    apiKey,
    baseURL: "https://api.x.ai/v1",
    timeout: 55_000,
  });

  let response;
  try {
    response = await client.responses.create({
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
  } catch (error) {
    if (isRejectedKey(error)) throw rejectedKey(apiKey);
    throw error;
  }

  if (response.status === "incomplete") {
    throw new Error("timeout");
  }

  const text = response.output_text?.trim();
  if (!text) throw new Error("empty");
  return JSON.parse(text);
}

export function publicError(error: unknown): { status: number; message: string } {
  const message = error instanceof Error ? error.message : "";
  if (message === "missing_key") {
    return { status: 500, message: "This deployment has no XAI_API_KEY set, so Daybook cannot call Grok yet." };
  }
  if (message === "timeout") {
    return { status: 504, message: "Grok took too long. Your brief is still here — try once more." };
  }
  if (message === "rejected_key") {
    const rawShape = error instanceof Error ? (error as ShapedError).shape : undefined;
    const shape = rawShape ?? "an unrecognized value";
    return { status: 502, message: rejectedKeyMessage(shape) };
  }
  const lower = message.toLowerCase();
  if (lower.includes("incorrect api key") || (lower.includes("invalid") && lower.includes("api key")) || message.includes("401")) {
    return { status: 502, message: rejectedKeyMessage("an unrecognized value") };
  }
  if (lower.includes("timed out") || lower.includes("timeout")) {
    return { status: 504, message: "Grok took too long. Your brief is still here — try once more." };
  }
  if (
    message.startsWith("The budget") ||
    message.startsWith("The timeline") ||
    message.startsWith("The vendor") ||
    message.startsWith("The ideas") ||
    message.startsWith("The concept") ||
    message.startsWith("The plan")
  ) {
    return { status: 502, message: `${message} Try once more.` };
  }
  return { status: 502, message: "Grok could not finish that. Your work is still here — try once more." };
}
