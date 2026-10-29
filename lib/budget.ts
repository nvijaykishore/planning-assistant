import type { BudgetLine } from "./types";
import { dollars } from "./format";

export function envelope(lines: { planned: number }[], contingency: number): number {
  return lines.reduce((sum, line) => sum + line.planned, 0) + contingency;
}

/** Scale every line and the contingency so they add up to `target`, keeping the model's proportions. */
export function scaleToTarget(
  lines: BudgetLine[],
  contingency: number,
  target: number,
): { lines: BudgetLine[]; contingency: number } {
  const goal = dollars(target);
  const base = lines.map((line) => ({ ...line, planned: dollars(line.planned) }));
  if (base.length === 0) return { lines: base, contingency: goal };

  let cont = dollars(contingency);
  const sum = envelope(base, cont);

  if (sum <= 0) {
    cont = Math.min(goal, Math.round(goal * 0.08));
    const room = goal - cont;
    const each = Math.floor(room / base.length);
    let leftover = room - each * base.length;
    for (const line of base) {
      line.planned = each + (leftover > 0 ? 1 : 0);
      if (leftover > 0) leftover -= 1;
    }
    return { lines: base, contingency: cont };
  }

  const scale = goal / sum;
  for (const line of base) line.planned = dollars(line.planned * scale);
  cont = dollars(cont * scale);
  return applyDrift(base, cont, goal);
}

/**
 * Hit the target while keeping essential lines still, when they fit.
 * If essentials already use the whole budget, every line scales.
 */
export function rebalanceToTarget(
  lines: BudgetLine[],
  contingency: number,
  target: number,
): { lines: BudgetLine[]; contingency: number } {
  const goal = dollars(target);
  const next = lines.map((line) => ({ ...line, planned: dollars(line.planned) }));
  const essentials = next.filter((line) => line.priority === "essential");
  const flexible = next.filter((line) => line.priority !== "essential");
  const essentialSum = essentials.reduce((sum, line) => sum + line.planned, 0);
  const flexPool = flexible.reduce((sum, line) => sum + line.planned, 0) + dollars(contingency);

  if (essentialSum >= goal || flexPool <= 0) {
    return scaleToTarget(next, contingency, goal);
  }

  if (flexible.length === 0) {
    return { lines: next, contingency: goal - essentialSum };
  }

  const scaled = scaleToTarget(flexible, contingency, goal - essentialSum);
  const plannedById = new Map(scaled.lines.map((line) => [line.id, line.planned]));
  const merged = next.map((line) =>
    line.priority === "essential" ? line : { ...line, planned: plannedById.get(line.id) ?? line.planned },
  );
  return { lines: merged, contingency: scaled.contingency };
}

function applyDrift(
  lines: BudgetLine[],
  contingency: number,
  goal: number,
): { lines: BudgetLine[]; contingency: number } {
  let cont = contingency;
  let drift = goal - envelope(lines, cont);
  if (drift === 0) return { lines, contingency: cont };

  const ordered = [...lines].sort((a, b) => b.planned - a.planned);
  const host = ordered.find((line) => line.planned + drift >= 0);
  if (host) {
    host.planned += drift;
    return { lines, contingency: cont };
  }
  if (cont + drift >= 0) {
    cont += drift;
    return { lines, contingency: cont };
  }
  return { lines, contingency: cont };
}
