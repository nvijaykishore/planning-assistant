import assert from "node:assert/strict";
import test from "node:test";
import { envelope, rebalanceToTarget, scaleToTarget } from "./budget";
import { getSample, sampleIds } from "./samples";
import type { BudgetLine } from "./types";

function line(id: string, planned: number, priority: BudgetLine["priority"]): BudgetLine {
  return { id, category: id, planned, spent: 0, note: "", priority };
}

test("scaleToTarget hits the budget exactly", () => {
  const scaled = scaleToTarget(
    [line("a", 40, "essential"), line("b", 40, "flexible")],
    20,
    80,
  );
  assert.equal(envelope(scaled.lines, scaled.contingency), 80);
});

test("scaleToTarget repairs rounding drift", () => {
  const scaled = scaleToTarget(
    [line("a", 33, "essential"), line("b", 33, "flexible")],
    33,
    100,
  );
  assert.equal(envelope(scaled.lines, scaled.contingency), 100);
});

test("scaleToTarget splits an empty budget across the lines", () => {
  const scaled = scaleToTarget(
    [line("a", 0, "flexible"), line("b", 0, "flexible"), line("c", 0, "flexible")],
    0,
    100,
  );
  assert.equal(envelope(scaled.lines, scaled.contingency), 100);
  assert.ok(scaled.lines.every((item) => item.planned >= 0));
});

test("rebalance keeps essentials when they fit", () => {
  const scaled = rebalanceToTarget(
    [line("keep", 60, "essential"), line("cut", 40, "flexible")],
    0,
    80,
  );
  assert.equal(envelope(scaled.lines, scaled.contingency), 80);
  assert.equal(scaled.lines.find((item) => item.id === "keep")?.planned, 60);
  assert.equal(scaled.lines.find((item) => item.id === "cut")?.planned, 20);
});

test("rebalance scales everything when essentials already overshoot", () => {
  const scaled = rebalanceToTarget(
    [line("keep", 90, "essential"), line("cut", 30, "flexible")],
    0,
    80,
  );
  assert.equal(envelope(scaled.lines, scaled.contingency), 80);
  assert.ok((scaled.lines.find((item) => item.id === "keep")?.planned ?? 0) < 90);
});

test("worked examples add up", () => {
  for (const id of sampleIds()) {
    const plan = getSample(id);
    assert.ok(plan);
    assert.equal(envelope(plan.budgetLines, plan.contingency), plan.brief.budget);
    assert.ok(plan.concept.length > 80);
    assert.ok(plan.vendors.every((vendor) => vendor.questions.length >= 2));
    assert.ok(new Set(plan.ideas.map((idea) => idea.kind)).size >= 4);
  }
});
