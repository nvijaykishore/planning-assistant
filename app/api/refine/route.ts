import { parseBrief } from "../../../lib/brief";
import { VisibleFailure } from "../../../lib/failures";
import { clipBlock } from "../../../lib/format";
import { completeJson } from "../../../lib/grok";
import { readRevision } from "../../../lib/normalize";
import { REFINE_INSTRUCTIONS, refinePrompt } from "../../../lib/prompt";
import { jsonResult, readJson } from "../../../lib/respond";
import { REFINE_SCHEMA } from "../../../lib/schema";
import type { ChatMessage, Plan } from "../../../lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

function chatTail(value: unknown): ChatMessage[] {
  if (!Array.isArray(value)) return [];
  const messages: ChatMessage[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    if (!("role" in item) || !("content" in item)) continue;
    if ((item.role === "user" || item.role === "assistant") && typeof item.content === "string") {
      messages.push({ role: item.role, content: item.content });
    }
  }
  return messages.slice(-6);
}

export function POST(request: Request) {
  return jsonResult("refine failed", async () => {
    const body = await readJson(request, "That request was not readable.");
    if (!body || typeof body !== "object") throw new VisibleFailure(400, "That request was empty.");

    const record = body as { message?: unknown; plan?: Plan };
    const message = clipBlock(record.message, 1000);
    if (message.length < 2) throw new VisibleFailure(400, "Say what you want changed.");

    const parsed = parseBrief(record.plan?.brief);
    if (!parsed.ok) throw new VisibleFailure(400, parsed.error);
    if (!record.plan || !Array.isArray(record.plan.budgetLines)) {
      throw new VisibleFailure(400, "The plan to revise was missing.");
    }

    const plan: Plan = {
      ...record.plan,
      brief: parsed.brief,
      chat: chatTail(record.plan.chat),
    };
    const json = await completeJson("daybook_revision", REFINE_SCHEMA, REFINE_INSTRUCTIONS, refinePrompt(plan, message));
    const revision = readRevision(json, parsed.brief.budget);
    return { reply: revision.reply, budgetTotal: revision.budgetTotal, plan: revision.plan };
  });
}
