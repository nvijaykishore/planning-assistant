import assert from "node:assert/strict";
import test from "node:test";
import { envelope } from "./budget";
import { applyRevision, materialize, readRawPlan } from "./normalize";
import type { Brief, Plan, RawPlan } from "./types";

const brief: Brief = {
  kind: "birthday",
  honorees: "Mateo",
  city: "Brooklyn",
  date: "2027-03-14",
  guests: 14,
  budget: 1000,
  currency: "USD",
  vibes: ["Kids"],
  feeling: "A dig site",
  mustHaves: "Pizza",
  constraints: "Peanut allergy",
  notes: "",
};

function raw(overrides: Partial<RawPlan> = {}): RawPlan {
  return {
    headline: "Dig day",
    concept: "Mateo digs in a Brooklyn yard with a peanut-safe table and a cake he can smash.",
    watchout: "Say the allergy out loud when the cake is ordered.",
    contingency: 100,
    budgetLines: [
      { category: "Pizza", planned: 400, note: "Plain pies.", priority: "essential" },
      { category: "Cake", planned: 200, note: "Nut-free.", priority: "essential" },
      { category: "Shade", planned: 300, note: "Afternoon sun.", priority: "flexible" },
    ],
    timeline: [
      { offsetDays: 14, whenLabel: "2 weeks before", title: "Order the cake", detail: "Mention peanuts." },
      { offsetDays: 0, whenLabel: "Day of", title: "Party", detail: "Dig, then cake." },
      { offsetDays: -1, whenLabel: "After", title: "Photos", detail: "Send them." },
    ],
    vendors: [
      {
        category: "Bakery",
        why: "The allergy lives here.",
        bookBy: "2 weeks before",
        budgetHint: "$200",
        questions: ["Can you keep peanuts out?"],
      },
      {
        category: "Pizza shop",
        why: "This is the meal.",
        bookBy: "1 week before",
        budgetHint: "$400",
        questions: ["Can one box be packed apart?"],
      },
    ],
    ideas: [
      { kind: "activity", title: "Shared pit", detail: "Fourteen kids in Mateo's yard." },
      { kind: "menu", title: "Separate box", detail: "The peanut allergy gets its own pizza box." },
    ],
    ...overrides,
  };
}

test("readRawPlan rejects a thin budget", () => {
  assert.throws(() => readRawPlan(raw({ budgetLines: [] })), /budget/i);
});

test("materialize makes the lines match the brief and keeps money already spent", () => {
  const first = materialize(brief, raw());
  first.budgetLines = first.budgetLines.map((line) =>
    line.category === "Cake" ? { ...line, spent: 50 } : line,
  );
  const revised = materialize(brief, raw(), first);
  assert.equal(envelope(revised.budgetLines, revised.contingency), 1000);
  assert.equal(revised.id, first.id);
  assert.equal(revised.budgetLines.find((line) => line.category === "Cake")?.spent, 50);
  assert.equal(revised.timeline.find((item) => item.title === "Order the cake")?.id, first.timeline.find((item) => item.title === "Order the cake")?.id);
});

test("applyRevision lowers the budget and remembers the conversation", () => {
  const plan = materialize(brief, raw());
  const next = applyRevision(plan, raw({ contingency: 50 }), 800, "Cut it to 800.", "I lowered the shade line and kept the cake.");
  assert.equal(next.brief.budget, 800);
  assert.equal(envelope(next.budgetLines, next.contingency), 800);
  assert.equal(next.chat.at(-1)?.content, "I lowered the shade line and kept the cake.");
  assert.equal(next.chat.at(0)?.content, "Cut it to 800.");
});

test("a plan with tracking fields still typechecks as a plan", () => {
  const plan: Plan = materialize(brief, raw());
  assert.equal(plan.origin, "generated");
  assert.equal(plan.vendors[0]?.status, "not_started");
});
