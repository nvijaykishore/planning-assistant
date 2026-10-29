import { parseBrief } from "../../../lib/brief";
import { VisibleFailure } from "../../../lib/failures";
import { completeJson } from "../../../lib/grok";
import { readRawPlan } from "../../../lib/normalize";
import { PLAN_INSTRUCTIONS, planPrompt } from "../../../lib/prompt";
import { jsonResult, readJson } from "../../../lib/respond";
import { PLAN_SCHEMA } from "../../../lib/schema";

export const runtime = "nodejs";
export const maxDuration = 60;

export function POST(request: Request) {
  return jsonResult("generate failed", async () => {
    const body = await readJson(request, "The brief was not readable.");
    const parsed = parseBrief(body);
    if (!parsed.ok) throw new VisibleFailure(400, parsed.error);
    const json = await completeJson("daybook_plan", PLAN_SCHEMA, PLAN_INSTRUCTIONS, planPrompt(parsed.brief));
    return { plan: readRawPlan(json) };
  });
}
