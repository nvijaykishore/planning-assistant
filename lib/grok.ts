import OpenAI from "openai";

const MODEL = "grok-4.7";

export async function completeJson(
  schemaName: string,
  schema: object,
  instructions: string,
  prompt: string,
): Promise<unknown> {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) throw new Error("missing_key");

  const client = new OpenAI({
    apiKey,
    baseURL: "https://api.x.ai/v1",
    timeout: 55_000,
  });

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
  const lower = message.toLowerCase();
  if (lower.includes("incorrect api key") || lower.includes("invalid") && lower.includes("api key") || message.includes("401")) {
    return { status: 502, message: "The model rejected the API key." };
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
