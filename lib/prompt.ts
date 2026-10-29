import type { Brief, Plan } from "./types";
import { daysUntil, money, perGuest, todayIso } from "./format";
import { KIND_META } from "./catalog";

export const PLAN_INSTRUCTIONS = `You are the planning producer inside Daybook. You write a working plan for one real event.

Rules:
- Be specific, calm, and practical. Plain sentences. No markdown, no emoji, no hashtags.
- Contingency is currency units, about 8 to 12 percent of the budget. Use about 5 percent when the budget is under 500.
- The sum of every budget line's planned amount plus contingency must equal the budget exactly.
- Scale ambition to the per-guest number you are given. A lean budget does not get a planner, a band, and a florist.
- Do not invent vendor brand names. Do not claim a specific venue is free. These are estimates, not quotes.
- Every idea must mention a concrete detail from this brief: a name, a place, a constraint, or a feeling. If an idea would fit any other event unchanged, rewrite it.
- Honor dietary, access, cultural, and religious constraints in the concept, a budget line or vendor question, and at least one idea.
- If the event is soon, do not pad the timeline with milestones that already had to happen. Keep one overdue item only when it is still worth chasing.
- If the date has passed, write a kind recap: balances, thank-yous, and what to remember next time.
- concept is two short paragraphs. watchout is one sentence. Notes and details are one sentence each.
- Timeline offsetDays is days before the event. 0 is the event day. Negative numbers are after it.`;

export const REFINE_INSTRUCTIONS = `You are revising an existing Daybook plan. Return the full plan plus a short reply.

Rules:
- Change what the user asked to change. Protect everything else, including the meal, access needs, and cultural or religious requirements, unless they asked you to change those.
- Keep category names and milestone titles stable when the user is only adjusting money or tone, so their checkmarks and amounts already spent still match.
- If they ask to cut the budget, lower budgetTotal and say what you removed.
- If they do not ask to change the budget, budgetTotal stays the same and the lines still add up to it, including contingency.
- Do not invent vendor brand names. Plain sentences. No markdown, no emoji.
- reply is two to four sentences: what changed, and what you refused to cut.
- Same shape and specificity rules as a new Daybook plan.`;

export function planPrompt(brief: Brief, today = todayIso()): string {
  const each = perGuest(brief.budget, brief.guests);
  const horizon = daysUntil(brief.date);
  return [
    `Today is ${today}.`,
    `Event: ${KIND_META[brief.kind].label}.`,
    `Who: ${brief.honorees}.`,
    `City: ${brief.city}.`,
    `Date: ${brief.date || "unset"}. ${horizonLine(horizon)}`,
    `Guests: ${brief.guests}.`,
    `Budget: ${money(brief.budget, brief.currency)} (${brief.currency}). About ${money(each, brief.currency)} per guest.`,
    tier(each),
    `Feeling: ${brief.feeling || "not stated"}.`,
    `Vibes: ${brief.vibes.length ? brief.vibes.join(", ") : "not stated"}.`,
    `Must-haves: ${brief.mustHaves || "not stated"}.`,
    `Constraints: ${brief.constraints || "not stated"}.`,
    `Notes: ${brief.notes || "not stated"}.`,
    "Write the plan for this brief only.",
  ].join("\n");
}

export function refinePrompt(plan: Plan, message: string, today = todayIso()): string {
  const spent = plan.budgetLines
    .filter((line) => line.spent > 0)
    .map((line) => `${line.category}: ${line.spent} of ${line.planned} already spent`)
    .join("; ");
  const snapshot = {
    headline: plan.headline,
    concept: plan.concept,
    watchout: plan.watchout,
    contingency: plan.contingency,
    budgetLines: plan.budgetLines.map(({ category, planned, note, priority }) => ({
      category,
      planned,
      note,
      priority,
    })),
    timeline: plan.timeline.map(({ offsetDays, whenLabel, title, detail, done }) => ({
      offsetDays,
      whenLabel,
      title,
      detail,
      done,
    })),
    vendors: plan.vendors.map(({ category, why, bookBy, budgetHint, questions, status }) => ({
      category,
      why,
      bookBy,
      budgetHint,
      questions,
      status,
    })),
    ideas: plan.ideas.map(({ kind, title, detail, pinned }) => ({ kind, title, detail, pinned })),
  };
  const history = plan.chat
    .slice(-6)
    .map((turn) => `${turn.role}: ${turn.content}`)
    .join("\n");
  return [
    planPrompt(plan.brief, today),
    spent ? `Already paid: ${spent}. Prefer not to delete a category that already has money spent.` : "Nothing has been marked spent yet.",
    history ? `Recent conversation:\n${history}` : "",
    `Current plan JSON:\n${JSON.stringify(snapshot)}`,
    `Request: ${message}`,
  ]
    .filter(Boolean)
    .join("\n\n");
}

function horizonLine(days: number | null): string {
  if (days === null) return "Date is unset, so use relative timing.";
  if (days < 0) return `That date was ${Math.abs(days)} days ago.`;
  if (days === 0) return "The event is today.";
  if (days <= 21) return `The event is ${days} days away, so the timeline must be compressed.`;
  return `The event is ${days} days away.`;
}

function tier(per: number): string {
  if (per < 40) {
    return "Per guest is lean. Assume home, potluck, borrowed goods, and paper. Do not recommend a venue, a band, a planner, or a florist.";
  }
  if (per < 150) {
    return "Per guest covers one paid anchor, usually food or space. Everything else should be simple, borrowed, or potluck.";
  }
  if (per < 400) {
    return "Per guest covers a real meal and a few paid vendors. Skip luxury add-ons that would break the number.";
  }
  return "Per guest can hold a full vendor set if each line is sized to this city and this guest count. Name the tradeoffs.";
}
