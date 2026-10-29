import type { Plan } from "./types";

const KEY = "daybook.plans.v1";

export function listPlans(): Plan[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isPlan).sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
  } catch {
    return [];
  }
}

export function loadPlan(id: string): Plan | null {
  return listPlans().find((plan) => plan.id === id) ?? null;
}

export function savePlan(plan: Plan): void {
  const plans = listPlans().filter((item) => item.id !== plan.id);
  plans.unshift(plan);
  window.localStorage.setItem(KEY, JSON.stringify(plans));
}

export function deletePlan(id: string): void {
  const plans = listPlans().filter((plan) => plan.id !== id);
  window.localStorage.setItem(KEY, JSON.stringify(plans));
}

function isPlan(value: unknown): value is Plan {
  if (!value || typeof value !== "object") return false;
  const plan = value as Plan;
  return (
    typeof plan.id === "string" &&
    Boolean(plan.brief) &&
    typeof plan.headline === "string" &&
    Array.isArray(plan.budgetLines) &&
    Array.isArray(plan.timeline) &&
    Array.isArray(plan.vendors) &&
    Array.isArray(plan.ideas)
  );
}
