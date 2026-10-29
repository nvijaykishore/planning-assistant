import { VIBES } from "./catalog";
import { clip, clipBlock, dollars } from "./format";
import { CURRENCIES, type Brief, type Currency, type EventKind } from "./types";

export function parseBrief(input: unknown): { ok: true; brief: Brief } | { ok: false; error: string } {
  if (!input || typeof input !== "object") return { ok: false, error: "The brief was empty." };
  const body = input as Record<string, unknown>;
  const kind = body.kind;
  if (kind !== "wedding" && kind !== "birthday" && kind !== "community") {
    return { ok: false, error: "Choose a wedding, a birthday, or a community event." };
  }
  const honorees = clip(body.honorees, 120);
  if (honorees.length < 2) return { ok: false, error: "Say who this is for." };
  const city = clip(body.city, 80);
  if (city.length < 2) return { ok: false, error: "Say which city." };
  const guests = dollars(body.guests);
  if (guests < 1 || guests > 5000) return { ok: false, error: "Guest count needs to be between 1 and 5,000." };
  const budget = dollars(body.budget);
  if (budget < 50 || budget > 5_000_000) {
    return { ok: false, error: "Budget needs to be between 50 and 5,000,000." };
  }
  if (!CURRENCIES.includes(body.currency as Currency)) return { ok: false, error: "Choose a currency." };
  let date = "";
  if (typeof body.date === "string" && body.date.trim()) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(body.date.trim())) {
      return { ok: false, error: "The date needs to be a real calendar day." };
    }
    date = body.date.trim();
  }
  const allowed = new Set(VIBES[kind]);
  const vibes = Array.isArray(body.vibes)
    ? body.vibes.filter((vibe): vibe is string => typeof vibe === "string" && allowed.has(vibe)).slice(0, 8)
    : [];

  return {
    ok: true,
    brief: {
      kind,
      honorees,
      city,
      date,
      guests,
      budget,
      currency: body.currency as Currency,
      vibes,
      feeling: clip(body.feeling, 200),
      mustHaves: clipBlock(body.mustHaves, 800),
      constraints: clipBlock(body.constraints, 800),
      notes: clipBlock(body.notes, 800),
    },
  };
}

export function isKind(value: string | null): value is EventKind {
  return value === "wedding" || value === "birthday" || value === "community";
}
