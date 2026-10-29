import { parseBrief } from "../../../lib/brief";
import { completeJson, publicError } from "../../../lib/grok";
import { PLAN_INSTRUCTIONS, planPrompt } from "../../../lib/prompt";
import { PLAN_SCHEMA } from "../../../lib/schema";
import { readRawPlan } from "../../../lib/normalize";

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

  try {
    const json = await completeJson("daybook_plan", PLAN_SCHEMA, PLAN_INSTRUCTIONS, planPrompt(parsed.brief));
    const plan = readRawPlan(json);
    return Response.json({ plan });
  } catch (error) {
    console.error("generate failed", error instanceof Error ? error.message : "unknown");
    const mapped = publicError(error);
    return Response.json({ error: mapped.message }, { status: mapped.status });
  }
}
