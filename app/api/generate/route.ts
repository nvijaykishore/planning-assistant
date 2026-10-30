import { parseBrief } from "../../../lib/brief";
import { completeJson } from "../../../lib/grok";
import { planRetry, readRawPlan } from "../../../lib/normalize";
import { PLAN_INSTRUCTIONS, planPrompt } from "../../../lib/prompt";
import { PLAN_SCHEMA } from "../../../lib/schema";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "The brief was not readable." }, { status: 400 });
  }

  const parsed = parseBrief(body);
  if (!parsed.ok) return Response.json({ error: parsed.error }, { status: 400 });

  const outcome = await completeJson("daybook_plan", PLAN_SCHEMA, PLAN_INSTRUCTIONS, planPrompt(parsed.brief));
  if (!outcome.ok) return Response.json({ error: outcome.message }, { status: outcome.status });

  try {
    return Response.json({ plan: readRawPlan(outcome.value) });
  } catch (error) {
    return Response.json({ error: planRetry(error) }, { status: 502 });
  }
}
