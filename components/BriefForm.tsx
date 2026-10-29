"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { isKind } from "../lib/brief";
import { demoBrief, emptyBrief, KIND_META, VIBES } from "../lib/catalog";
import { daysLabel, money, perGuest } from "../lib/format";
import { materialize, readRawPlan } from "../lib/normalize";
import { loadPlan, savePlan } from "../lib/storage";
import type { Brief, EventKind } from "../lib/types";
import { Shell } from "./Shell";

export function BriefForm() {
  const params = useSearchParams();
  const router = useRouter();
  const kindParam = params.get("kind");
  const demo = params.get("demo") === "1";
  const existingId = params.get("plan");
  const [brief, setBrief] = useState<Brief>(() => emptyBrief(isKind(kindParam) ? kindParam : "wedding"));
  const [planId, setPlanId] = useState<string | null>(null);
  const [origin, setOrigin] = useState<"sample" | "generated" | null>(null);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (existingId) {
      const plan = loadPlan(existingId);
      if (plan) {
        setBrief(plan.brief);
        setPlanId(plan.id);
        setOrigin(plan.origin);
        return;
      }
    }
    const kind: EventKind = isKind(kindParam) ? kindParam : "wedding";
    setBrief(demo ? demoBrief(kind) : emptyBrief(kind));
  }, [existingId, demo, kindParam]);

  const each = useMemo(() => perGuest(brief.budget, brief.guests), [brief.budget, brief.guests]);

  function patch(partial: Partial<Brief>) {
    setBrief((current) => ({ ...current, ...partial }));
  }

  function toggleVibe(vibe: string) {
    setBrief((current) => {
      const has = current.vibes.includes(vibe);
      return { ...current, vibes: has ? current.vibes.filter((item) => item !== vibe) : [...current.vibes, vibe] };
    });
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setPending(true);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(brief),
        signal: AbortSignal.timeout(70_000),
      });
      const data = (await response.json()) as { error?: string; plan?: unknown };
      if (!response.ok) throw new Error(data.error || "Grok could not finish the plan.");
      const previous = planId ? loadPlan(planId) ?? undefined : undefined;
      const plan = materialize(brief, readRawPlan(data.plan), previous);
      if (origin) plan.origin = origin;
      savePlan(plan);
      router.push(`/plan/${plan.id}`);
    } catch (caught) {
      const timedOut = caught instanceof DOMException && (caught.name === "TimeoutError" || caught.name === "AbortError");
      setError(timedOut ? "Grok took too long. Your brief is still here — try once more." : caught instanceof Error ? caught.message : "Something went wrong.");
      setPending(false);
    }
  }

  return (
    <Shell trailing={<Link href="/">All plans</Link>}>
      <div className="brief-layout">
        <form onSubmit={onSubmit}>
          <p className="kicker">{planId ? "Revise the brief" : "New plan"}</p>
          <h1>{KIND_META[brief.kind].label} brief</h1>
          <p className="quiet">Grok writes the plan from this page. Daybook checks that the lines add up to your number.</p>

          {error ? <p className="alert" role="alert">{error}</p> : null}

          <fieldset className="field" style={{ border: 0, padding: 0 }}>
            <legend className="lbl">Event</legend>
            <div className="chips">
              {(Object.keys(KIND_META) as EventKind[]).map((kind) => (
                <button
                  key={kind}
                  type="button"
                  className="chip"
                  aria-pressed={brief.kind === kind}
                  onClick={() => patch({ kind, vibes: [] })}
                >
                  {KIND_META[kind].label}
                </button>
              ))}
            </div>
          </fieldset>

          <label className="field">
            <span className="lbl">Who it is for</span>
            <input type="text" value={brief.honorees} onChange={(event) => patch({ honorees: event.target.value })} required maxLength={120} placeholder="Priya and Jonah" />
          </label>
          <div className="grid-2">
            <label className="field">
              <span className="lbl">City</span>
              <input type="text" value={brief.city} onChange={(event) => patch({ city: event.target.value })} required maxLength={80} placeholder="Hudson Valley" />
            </label>
            <label className="field">
              <span className="lbl">Date</span>
              <input type="date" value={brief.date} onChange={(event) => patch({ date: event.target.value })} />
              <span className="hint">{brief.date ? daysLabel(brief.date) : "Leave blank if the date is still moving."}</span>
            </label>
          </div>
          <div className="grid-2">
            <label className="field">
              <span className="lbl">Guests</span>
              <input type="number" min={1} max={5000} value={brief.guests || ""} onChange={(event) => patch({ guests: Number(event.target.value) })} required />
            </label>
            <label className="field">
              <span className="lbl">Budget</span>
              <input type="number" min={50} max={5000000} value={brief.budget || ""} onChange={(event) => patch({ budget: Number(event.target.value) })} required />
            </label>
          </div>
          <label className="field">
            <span className="lbl">Currency</span>
            <select value={brief.currency} onChange={(event) => patch({ currency: event.target.value as Brief["currency"] })}>
              {["USD", "EUR", "GBP", "CAD", "INR", "AUD"].map((currency) => (
                <option key={currency}>{currency}</option>
              ))}
            </select>
            <span className="hint">{brief.guests > 0 && brief.budget > 0 ? `About ${money(each, brief.currency)} a guest.` : "Add guests and a budget."}</span>
          </label>

          <div className="field">
            <span className="lbl">Vibe</span>
            <div className="chips">
              {VIBES[brief.kind].map((vibe) => (
                <button key={vibe} type="button" className="chip" aria-pressed={brief.vibes.includes(vibe)} onClick={() => toggleVibe(vibe)}>
                  {vibe}
                </button>
              ))}
            </div>
          </div>
          <label className="field">
            <span className="lbl">What should it feel like?</span>
            <input type="text" value={brief.feeling} onChange={(event) => patch({ feeling: event.target.value })} maxLength={200} placeholder="An orchard afternoon that becomes a long dinner" />
          </label>
          <label className="field">
            <span className="lbl">Must-haves</span>
            <textarea value={brief.mustHaves} onChange={(event) => patch({ mustHaves: event.target.value })} maxLength={800} />
          </label>
          <label className="field">
            <span className="lbl">Constraints</span>
            <textarea value={brief.constraints} onChange={(event) => patch({ constraints: event.target.value })} maxLength={800} placeholder="Allergies, access, faith, weather, kids, a hard ceiling on the budget." />
          </label>
          <label className="field">
            <span className="lbl">Anything else</span>
            <textarea value={brief.notes} onChange={(event) => patch({ notes: event.target.value })} maxLength={800} />
          </label>

          <div className="actions">
            <button className="btn" type="submit" disabled={pending} data-testid="write-plan">
              {pending ? "Writing the plan…" : "Write the plan"}
            </button>
            {pending ? <span className="quiet">This usually takes under a minute.</span> : null}
          </div>
        </form>

        <aside className="aside" data-kind={brief.kind}>
          <p className="kicker">Daybook will write</p>
          <ol>
            <li>A concept that uses the names and constraints on this page.</li>
            <li>A budget whose lines plus contingency equal {brief.budget > 0 ? money(brief.budget, brief.currency) : "your number"}.</li>
            <li>A timeline measured from {brief.date ? daysLabel(brief.date).toLowerCase() : "whenever you set the date"}.</li>
            <li>A vendor checklist with questions worth asking, and ideas that would not fit a different event.</li>
          </ol>
          <p className="hint">Estimates, not quotes. No invented vendor brands.</p>
        </aside>
      </div>
    </Shell>
  );
}
