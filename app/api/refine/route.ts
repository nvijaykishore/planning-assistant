import { parseBrief } from "../../../lib/brief";
import { clipBlock } from "../../../lib/format";
import { completeJson } from "../../../lib/grok";
import { planRetry, readRevision } from "../../../lib/normalize";
import { REFINE_INSTRUCTIONS, refinePrompt } from "../../../lib/prompt";
import { REFINE_SCHEMA } from "../../../lib/schema";
import type { Plan } from "../../../lib/types";

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
    chat: Array.isArray(record.plan.chat) ? record.plan.chat.slice(-6) : [],
  };
  const outcome = await completeJson("daybook_revision", REFINE_SCHEMA, REFINE_INSTRUCTIONS, refinePrompt(plan, message));
  if (!outcome.ok) return Response.json({ error: outcome.message }, { status: outcome.status });

  try {
    const revision = readRevision(outcome.value, parsed.brief.budget);
    return Response.json({ reply: revision.reply, budgetTotal: revision.budgetTotal, plan: revision.plan });
  } catch (error) {
    return Response.json({ error: planRetry(error) }, { status: 502 });
  }
}
