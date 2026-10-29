import { parseBrief } from "../../../lib/brief";
import { clipBlock } from "../../../lib/format";
import { completeJson, publicError } from "../../../lib/grok";
import { readRawPlan } from "../../../lib/normalize";
import { REFINE_INSTRUCTIONS, refinePrompt } from "../../../lib/prompt";
import { REFINE_SCHEMA } from "../../../lib/schema";
import type { ChatMessage, Plan } from "../../../lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "That request was not readable." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return Response.json({ error: "That request was empty." }, { status: 400 });
  }
  const record = body as { message?: unknown; plan?: Plan };
  const message = clipBlock(record.message, 1000);
  if (message.length < 2) return Response.json({ error: "Say what you want changed." }, { status: 400 });

  const parsed = parseBrief(record.plan?.brief);
  if (!parsed.ok) return Response.json({ error: parsed.error }, { status: 400 });
  if (!record.plan || !Array.isArray(record.plan.budgetLines)) {
    return Response.json({ error: "The plan to revise was missing." }, { status: 400 });
  }

  const plan: Plan = {
    ...record.plan,
    brief: parsed.brief,
    chat: Array.isArray(record.plan.chat) ? record.plan.chat.slice(-6) as ChatMessage[] : [],
  };

  try {
    const json = await completeJson("daybook_revision", REFINE_SCHEMA, REFINE_INSTRUCTIONS, refinePrompt(plan, message));
    const reply = clipBlock((json as { reply?: unknown }).reply, 800);
    const budgetTotal = Number((json as { budgetTotal?: unknown }).budgetTotal);
    const raw = readRawPlan(json);
    return Response.json({
      reply: reply || "The plan is updated.",
      budgetTotal: Number.isFinite(budgetTotal) ? budgetTotal : parsed.brief.budget,
      plan: raw,
    });
  } catch (error) {
    console.error("refine failed", error instanceof Error ? error.message : "unknown");
    const mapped = publicError(error);
    return Response.json({ error: mapped.message }, { status: mapped.status });
  }
}
